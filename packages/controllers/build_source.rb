#!/usr/bin/env ruby

require "fileutils"
require_relative "./rb2js.config"

source = "src"
dir = "dist"

if Dir.exist?(dir)
  FileUtils.rm_r dir
end

Dir.mkdir dir 

files = Dir["#{source}/**/*.js.rb"]

Dir.chdir(dir) do
  files.each do |ruby_file|
    dest_path = File.expand_path ruby_file.delete_prefix(source + "/"), "../dist"

    ruby_code = File.read File.expand_path(ruby_file, "../")
    js_code = Ruby2JS::Loader.process ruby_code

    FileUtils.mkdir_p File.dirname(dest_path)
    File.write dest_path.chomp(".rb"), js_code
  end
end
