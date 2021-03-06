# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.



# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)


import datetime

def get_user_email():
    return None if auth.user is None else auth.user.email

def get_current_time():
    return datetime.datetime.utcnow()

db.define_table('post',
                Field('post_author', default=get_user_email()),
                Field('post_title'),
                Field('post_content', 'text'),
                Field('post_time', 'datetime', default=get_current_time()),
                Field('post_date'),
                Field('post_format'),
                Field('matches', 'list:string'),
                Field('match_info', 'json')
                )

# Likes.
db.define_table('user_like',
                Field('user_email'), # The user who flagged
                Field('post_id', 'reference post'), # The flagged post
)

# Stars ratings
db.define_table('user_star',
                Field('user_email'), # The user who starred
                Field('post_id', 'reference post'), # The starred post
                Field('rating', 'integer', default=None) # The star rating.
                )

# Thumbs
db.define_table('thumb',
                Field('user_email'), # The user who thumbed, easier to just write the email here.
                Field('post_id', 'reference post'), # The thumbed post
                Field('thumb_state'), # This can be 'u' for up or 'd' for down, or None for... None.
                )

db.define_table('reply',
                Field('reply_id', 'reference post'),
                Field('reply_author', default=get_user_email()),
                Field('reply_content', 'text'),
                Field('reply_time', 'datetime', update=get_current_time())
                )


db.define_table('user_join',
                Field('user_email'),
                Field('post_id', 'reference post'),
                Field('round2', default=False), 
                Field('round3', default=False), 
                Field('round4', default=False), 
    )
