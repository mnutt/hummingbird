require "rubygems"
require "mongo"

@db = Mongo::Connection.new.db('hummingbird')

@coll = @db.collection("metrics");

count = @coll.count

i = 0
@coll.find.each do |visit|
  i += 1
  if visit['timestamp'].class != Time
    visit['timestamp'] = Time.at(visit['timestamp'] / 1000)
    visit['day'] = Time.at(visit['day'] / 1000)
    visit['hour'] = Time.at(visit['hour'] / 1000)
    visit['minute'] = Time.at(visit['minute'] / 1000)
    @coll.save(visit)
    puts "#{i} / #{count}" if i % 1000 == 0
  end
end
