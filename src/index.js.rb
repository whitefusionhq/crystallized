import [ LitElement, html ], from: "lit"
import [ DeclarativeActionsController ], from: "./controllers"

export class CrystallineElement < LitElement
  def self.define(name, options = {}, functional_component = nil)
    klass = functional_component ? `"class extends CrystallineElement {}"` : self

    if functional_component
      klass.define_method(:render) { functional_component(self) }
    end

    if options[:shadow_dom] == false
      klass.define_method(:create_render_root) { self }
    else
      if !klass.method_defined?(:render, false)
        klass.define_method(:render) { html "<slot></slot>" }
      end
    end

    if (options.properties)
      klass.properties = options.properties
    end

    begin  
      custom_elements.define(name, klass)
    rescue Error => e
      console.warn("#{name} already registered", e)
    end
  end

  ### Useful shorthands for Ruby2JS users:

  def self.property(name, type, options = {})
    self.properties ||= {}
    self.properties[name] = {type: type, **options}
  end

  def self.stylesheet(cssresult) = self.styles = cssresult

  def self.target(name, selector)
    self.targets ||= {}
    self.targets[name] = selector
  end

  # Set up all the properties and targets
  def initialize
    super

    @actions = DeclarativeActionsController.new(self)

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
              node&.closest(self.node_name.downcase()) == self
            end
          end
        })
      else
        selector = targetized_selector(name, selector)
        Object.define_property(self, "_#{name}", {
          get: ->() do
            node = self.query_selector(selector)
            node if node&.closest(self.node_name.downcase()) == self
          end
        })
      end
    end if self.class.targets

    self
  end
end

export def crystallize(name, options, component)
  CrystallineElement.define(name, options, component)
end
