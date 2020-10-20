require "ruby2js/filter/functions"
require "ruby2js/filter/camelCase"
require "ruby2js/filter/return"
require "ruby2js/filter/esm"
require "ruby2js/filter/tagged_templates"

module Ruby2JS
  class Loader
    def self.options
      # Change the options for your configuration here:
      {
        eslevel: 2021,
        include: :class,
        underscored_private: true
      }
    end

    def self.process(source)
      Ruby2JS.convert(source, self.options).to_s
    end
  end
end
