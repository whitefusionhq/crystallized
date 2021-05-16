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

export [ DeclarativeActionsController ]
