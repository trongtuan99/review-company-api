class Role < ApplicationRecord
  enum role: {
    user: 1,
    admin: 2,
    owner: 3,
    anonymous: 4,
  }

  enum status: {
    active: 1,
    inactive: 2,
    deleted: 3,
  }

  has_many :users
end
