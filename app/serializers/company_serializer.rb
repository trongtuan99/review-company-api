class CompanySerializer < BaseSerializer
  attributes :id, :name, :owner, :logo, :website, :phone,
             :main_office, :created_at, :updated_at,
             :total_reviews, :avg_score, :company_size, :company_type,
             :created_at_timestamp, :updated_at_timestamp, :is_active, :logo,
             :avg_score, :is_good_company, :is_deleted, :industry,
             :employee_count_min, :employee_count_max, :is_hiring, :employee_count_range

  def employee_count_range
    return nil unless object.employee_count_min || object.employee_count_max
    
    min = object.employee_count_min || 0
    max = object.employee_count_max || 0
    
    return nil if min == 0 && max == 0
    
    if min > 0 && max > 0 && min != max
      "#{min} - #{max} nhân viên"
    elsif max > 0
      if max < 25
        "Dưới 25 nhân viên"
      elsif max < 100
        "25 - 100 nhân viên"
      elsif max < 200
        "100 - 200 nhân viên"
      elsif max < 500
        "200 - 500 nhân viên"
      elsif max < 1000
        "500 - 1.000 nhân viên"
      elsif max < 5000
        "1.000 - 5.000 nhân viên"
      else
        "Trên 5.000 nhân viên"
      end
    elsif min > 0
      if min < 25
        "Dưới 25 nhân viên"
      elsif min < 100
        "25 - 100 nhân viên"
      elsif min < 200
        "100 - 200 nhân viên"
      elsif min < 500
        "200 - 500 nhân viên"
      elsif min < 1000
        "500 - 1.000 nhân viên"
      elsif min < 5000
        "1.000 - 5.000 nhân viên"
      else
        "Trên 5.000 nhân viên"
      end
    else
      nil
    end
  end
end