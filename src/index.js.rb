import [ LitElement, html ], from: "lit-element"

# Lambda for determining default node action
default_action_for_node = ->(node) do
  case node.node_name.downcase()
  when :form
    :submit
  when :input, :textarea
    return node.get_attribute(:type) == :submit ? :click : :input
  when :select
    :change
  else
    :click
  end
end

export class CrystallineElement < LitElement
  def self.define(name, options = {}, functional_component = nil)
    klass = functional_component ? (`"class extends CrystallineElement {}"`) : self

    klass.prototype.create_render_root = `"function() { return this }"` if options[:shadow_dom] == false

    if (options.properties)
      klass.properties = options.properties
    end

    if options[:pass_through]
      klass.prototype.render = undefined
    elsif functional_component
      klass.prototype.render = `"function() { return functionalComponent(this) }"`
    end

    custom_elements.define(name, klass)
  end

  def initialize
    super

    # Set initial default values
    self.class.properties.each_pair do |property, config|
      self[property] = config[:default]
    end if self.class.properties

    # button@target => button[custom-element-target='identifier']
    targetized_selector = ->(name, selector) do
      if selector == "@"
        name = name.gsub("_", "-").gsub(/([^A-Z])([A-Z])/, "$1-$2").downcase()
        "*[#{self.node_name}-target='#{name}']"
      else
        selector.gsub(/@([a-z-]+)/, "[#{self.node_name}-target='$1']")
      end
    end

    # Add queries as instance properties
    self.class.targets.each_pair do |name, selector|
      if selector.is_a?(Array)
        selector = targetized_selector(name, selector[0])
        Object.define_property(self, "_#{name}", {
          get: ->() do
            Array(self.query_selector_all(selector)).select do |node|
              @nested_nodes.select do |nested_node|
                nested_node.contains? node
              end.length == 0
            end
          end
        })
      else
        selector = targetized_selector(name, selector)
        Object.define_property(self, "_#{name}", {
          get: ->() do
            node = self.query_selector(selector)
            node if @nested_nodes.select do |nested_node|
              nested_node.contains? node
            end.length == 0
          end
        })
      end
    end if self.class.targets

    self
  end

  # Set up MutationObserver and get ready to look for action definitions
  def connected_callback()
    super

    @registered_actions = []
    @nested_nodes = []

    handle_nodechanges([{
      type: :attributes,
      target: self
    }])

    @node_observer = MutationObserver.new(handle_nodechanges.bind(self))
    config = { attributes: true, childList: true, subtree: true }
    @node_observer.observe self, config
  end

  def disconnected_callback()
    super

    @node_observer.disconnect()
    @registered_actions = []
    @nested_nodes = []
  end

  # Callback for MutationObserver
  def handle_nodechanges(changes)
    self_name = self.node_name.downcase()
    action_attr = "#{self_name}-action"

    # Lambda to set up event listeners
    setup_listener = ->(node, include_self_node) do
      if !include_self_node and node.node_name == self.node_name # don't touch nested elements
        @nested_nodes.push node
        next
      end

      # make sure node isn't inside a nested node
      next if @nested_nodes.find do |nested_node|
        nested_node.contains? node
      end

      if node.has_attribute(action_attr)
        node.get_attribute(action_attr).split(" ").each do |action_pair|
          action_event, action_name = action_pair.split("->")
          unless defined? action_name
            action_name = action_event
            action_event = default_action_for_node(node)
          end
          action_event = action_event.strip()
          next if @registered_actions.find {|action| action.node == node && action.event == action_event && action.name == action_name }
          node.add_event_listener(action_event, self[action_name].bind(self))
          @registered_actions.push({
            node: node,
            event: action_event,
            name: action_name
          })
        end
      end
    end

    unless @node_observer
      # It's a first run situation, so check all child nodes
      self.query_selector_all("[#{action_attr}]").each do |node|
        setup_listener(node, false)
      end
    end

    # Loop through all the mutations
    changes.each do |change|
      if change.type == :child_list
        change.added_nodes.each do |node|
          next unless node.node_type == 1 # only process element nodes
          setup_listener(node, false)
          node.query_selector_all("[#{action_attr}]").each do |inside_node|
            setup_listener(inside_node, false)
          end
        end
        change.removed_nodes.each do |node|
          # clear out removed nested nodes
          next unless node.node_name == self.node_name
          @nested_nodes = @nested_nodes.select do |nested_node|
            nested_node != node
          end
        end
      elsif change.type == :attributes
        setup_listener(change.target, true)
      end
    end
  end

  def first_updated()
    handle_nodechanges([{
      type: :child_list,
      added_nodes: this.query_selector_all("*"),
      removed_nodes: []
    }])
  end

  def render()
    html "<slot></slot>"
  end
end

export def crystallize(name, options, component)
  CrystallineElement.define(name, options, component)
end
