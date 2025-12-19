class SidekiqQueue
  CLOCK_MISSION            = 'clock_mission'.freeze
  FIND_AND_DESTROY_COMPANY = 'find_and_destroy_company'.freeze
  FIND_AND_DESTROY_REVIEWS = 'find_and_destroy_reviews'.freeze
  HANDLE_LIKE_EVENT        =  'handle_like_event'.freeze
  DELETE_USER              =  'delete_user'.freeze
end

class Tenant
  DEFAULT_SCHEMA = 'public'.freeze
  ASIA_SCHEMA    =  'asia'.freeze
  EUROPE_SCHEMA  =  'europe'.freeze
  AMERICA_SCHEMA = 'america'.freeze
end

class LikeEventAction
  CREATE =  'create'.freeze
  UPDATE =  'update'.freeze
end
