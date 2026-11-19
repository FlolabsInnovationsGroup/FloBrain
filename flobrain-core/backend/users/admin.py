from django.contrib import admin

from .models import Role, User, UserRole

admin.site.register(Role)
admin.site.register(User)
# UserRole is the only way to assign a Role to a User today - User.roles is a
# ManyToManyField with a custom `through` model, which Django's default admin
# form silently omits from the User change page. Registering UserRole here
# (plain Django Admin, not a new API/UI) is what actually lets an admin
# create/remove a user-role assignment, e.g. granting the "admin" role needed
# by users.permissions.IsAdmin.
admin.site.register(UserRole)