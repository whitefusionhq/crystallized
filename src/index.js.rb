import [ LitElement, html ], from: "lit"
import [ DeclarativeActionsController, TargetsController ], from: "./controllers"

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

    @actions_controller = DeclarativeActionsController.new(self)
    @targets_controller = TargetsController.new(self)

    # Set initial default values
    self.class.properties.each_pair do |property, config|
      self[property] = config[:default]
    end if self.class.properties

    # Keep explicit return
    self
  end
end

export def crystallize(name, options, component)
  CrystallineElement.define(name, options, component)
end
