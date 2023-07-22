class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :pixels

  def get_last_pixel_color
    # guard clause, return white if no pixels
    return "white" if self.pixels.empty?

    self.pixels.last.color 
  end
end
