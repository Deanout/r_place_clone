class Pixel < ApplicationRecord
  belongs_to :user

  after_create_commit {
    ActionCable.server.broadcast('pixels_channel', self)
  }
end
