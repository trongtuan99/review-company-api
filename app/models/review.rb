class Review < ApplicationRecord
  include BaseConcern

  enum employment_status: {
    not_specified: 0,
    current_employee: 1,
    former_employee: 2
  }

  validates :title, presence: true, length: { minimum: 5, maximum: 100 }
  validates :total_dislike, :total_like, :total_reply, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :salary_satisfaction, :work_life_balance, :career_growth, :management_rating, :culture_rating,
            numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 5 }, allow_nil: true

  belongs_to :user, optional: true
  belongs_to :company
  has_many :replies, dependent: :destroy
  has_many :likes, dependent: :destroy

  before_create :set_default_values
  after_commit :increment_company_total_review, on: :create
  after_commit :decrement_company_total_review, on: :destroy
  after_commit :update_company_avg_score, on: [:create, :update, :destroy]

  private

  def increment_company_total_review
    return unless company
    Company.transaction do
      company.increment!(:total_reviews, 1)
    end
  end

  def decrement_company_total_review
    return unless company
    Company.transaction do
      company.decrement!(:total_reviews, 1) if company.total_reviews > 0
    end
  end

  def update_company_avg_score
    return unless company

    Company.transaction do
      reviews_count = company.reviews.count
      if reviews_count.zero?
        company.update_column(:avg_score, nil)
        return
      end

      total_score = company.reviews.sum(:score)
      new_avg_score = total_score.to_f / reviews_count
      company.update_column(:avg_score, new_avg_score)
    end
  end

  def set_default_values
    self.is_anonymous = true if self.is_anonymous.nil?
    self.vote_for_quit = false if self.vote_for_quit.nil?
    self.vote_for_work = false if self.vote_for_work.nil?
  end
end
