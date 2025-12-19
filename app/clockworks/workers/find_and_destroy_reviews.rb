class Workers::FindAndDestroyReviews
  include Sidekiq::Worker
  sidekiq_options queue: SidekiqQueue::FIND_AND_DESTROY_REVIEWS, retry: false

  def perform review_id
    review = Review.find_by(id: review_id)
    return unless review
    Review.transaction do
      review.destroy!
    end
    puts "deleted review #{review_id}"
  end

  def execute
    need_deletes = Review.where(is_deleted: true).ids
    need_deletes.each_slice(50) do |review_ids|
      review_ids.each {|review_id| Workers::FindAndDestroyReviews.perform_async(review_id)}
    end
  end

end