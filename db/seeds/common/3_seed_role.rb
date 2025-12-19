[
  {
    role: "user",
    allow_all_action: false,
    allow_create: true,
    allow_update: false,
    allow_read: true,
    status: 1
  },
  {
    role: "admin",
    allow_all_action: false,
    allow_create: true,
    allow_update: true,
    allow_read: true,
    status: 1
  },
  {
    role: "owner",
    allow_all_action: true,
    allow_create: true,
    allow_update: true,
    allow_read: true,
    status: 1
  },
  {
    role: "anonymous",
    allow_all_action: false,
    allow_create: false,
    allow_update: false,
    allow_read: false,
    status: 1
  },
].each do |role|
  Role.create!(role) unless Role.exists?(role: role[:role])
end