# Controller to loop through light DOM on connection + mutations and find
# declared actions
class DeclarativeActionsController
  def initialize(host)
    @host = host
    host.add_controller(self)
  end

  # Set up MutationObserver and get ready to look for action definitions
  def host_connected()
    @registered_actions = []

    handle_node_changes([{
      type: :attributes,
      target: @host
    }])

    @node_observer = MutationObserver.new(handle_node_changes.bind(self))
    config = { attributes: true, childList: true, subtree: true }
    @node_observer.observe @host, config
  end

  def host_disconnected()
    @node_observer.disconnect()
    @registered_actions = []
  end

  def default_action_for_node(node)
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

  # Callback for MutationObserver
  def handle_node_changes(changes)
    host_name = @host.node_name.downcase()
    action_attr = "#{host_name}-action"

    # Lambda to set up event listeners
    setup_listener = ->(node, only_host_node) do
      next if !only_host_node && Array(@host.query_selector_all(host_name)).select do |el|
        el.contains? node
      end.length > 0 # make sure node isn't inside a nested tag

      if node.has_attribute(action_attr)
        node.get_attribute(action_attr).split(" ").each do |action_pair|
          action_event, action_name = action_pair.split("->")
          unless defined? action_name
            action_name = action_event
            action_event = default_action_for_node(node)
          end
          action_event = action_event.strip()
          next if @registered_actions.find {|action| action.node == node && action.event == action_event && action.name == action_name }
          node.add_event_listener(action_event, @host[action_name].bind(@host))
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
      @host.query_selector_all("[#{action_attr}]").each do |node|
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
      elsif change.type == :attributes
        setup_listener(change.target, true)
      end
    end
  end

  def host_updated()
    unless @first_updated
      handle_node_changes([{
        type: :child_list,
        added_nodes: @host.query_selector_all("*"),
        removed_nodes: []
      }])
      @first_updated = true
    end
  end
end

# Targets let you query for elements in the light DOM
class TargetsController
  def initialize(host)
    @host = host
    @node_name = @host.node_name

    # Add queries as instance properties
    @host.class.targets.each_pair do |name, selector|
      if selector.is_a?(Array)
        selector = targetized_selector(name, selector[0])
        Object.define_property(@host, "_#{name}", {
          get: ->() do
            Array(@host.query_selector_all(selector)).select do |node|
              node.closest(@node_name) == @host
            end
          end
        })
      else
        selector = targetized_selector(name, selector)
        Object.define_property(@host, "_#{name}", {
          get: ->() do
            node = @host.query_selector(selector)
            node && node.closest(@node_name) == @host ? node : null
          end
        })
      end
    end if @host.class.targets
  end

  def targetized_selector(name, selector)
    if selector == "@"
      name = name.gsub("_", "-").gsub(/([^A-Z])([A-Z])/, "$1-$2").downcase()
      "*[#{@node_name}-target='#{name}']"
    else
      selector.gsub(/@([a-z-]+)/, "[#{@node_name}-target='$1']")
    end
  end
end

export [ DeclarativeActionsController, TargetsController ]
