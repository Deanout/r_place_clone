class PixelsController < ApplicationController
    before_action :authenticate_user!, only: [:create, :update]
    def index
        @pixels = Pixel.all
        render json: @pixels
    end

    def create
        @pixel = Pixel.new(pixel_params.merge(user: current_user))

        if @pixel.save
            render json: @pixel, status: :created
        else
            render json: @pixel.errors, status: :unprocessable_entity
        end
    end 

    def update
        @pixel = Pixel.find(params[:id])
    
        if @pixel.update(pixel_params)
          render json: @pixel
        else
          render json: @pixel.errors, status: :unprocessable_entity
        end
    end

    private 

    
    def pixel_params
    params.require(:pixel).permit(:x, :y, :color)
    end
end
