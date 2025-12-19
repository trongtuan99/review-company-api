class Workers::FindAndDestroyCompany
  include Sidekiq::Worker
  sidekiq_options queue: SidekiqQueue::FIND_AND_DESTROY_COMPANY, retry: false

  def perform company_id
    company = Company.find_by(id: company_id)
    return unless company
    Company.transaction do
      company.destroy
    end
    puts "deleted company #{company_id}"
  end

  def execute
    need_deletes = Company.where(is_deleted: true).ids
    need_deletes.each do |company_id|
      Workers::FindAndDestroyCompany.perform_async company_id
    end
  end

end