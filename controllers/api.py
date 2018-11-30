# Here go your api methods.


@auth.requires_signature()
def add_post():
    post_id = db.post.insert(
        post_title=request.vars.post_title,
        post_content=request.vars.post_content,
        post_date = request.vars.post_date,
        post_format = request.vars.post_format,
    )
    # We return the id of the new post, so we can insert it along all the others.
    return response.json(dict(post_id=post_id))


def get_post_list():
    results = []
        # Not logged in.
    rows = db().select(db.post.ALL, orderby=~db.post.post_time)
    for row in rows:
        results.append(dict(
            id=row.id,
            post_title=row.post_title,
            post_content=row.post_content,
            post_author=row.post_author,
            post_date= row.post_date,
            post_format= row.post_format,
            like = False, # Anyway not used as the user is not logged in. 
            rating = None, # As above
            ))

    # For homogeneity, we always return a dictionary.
    return response.json(dict(post_list=results))
    
def get_replies():
    reply = db(db.reply.reply_id == request.vars.id).select()
    return response.json(dict(replies=reply))

def set_replies():
    movieID = int(request.vars.reply_id)
    bodyText = request.vars.reply_content
    new_reply_id = db.reply.insert(
        reply_id = movieID,
        reply_content = bodyText
    )
    return response.json(dict(new_reply_id = new_reply_id))


@auth.requires_signature()
def get_title():
    u = get_user_email()
    t = db(db.post.post_author == u).select().first()
    return response.json(dict(post_content=t.post_content or ""))

@auth.requires_signature()
def edit_post():
    post_id = int(request.vars.post_id);
    u = get_user_email()
    print(request.vars.post_content)
    print(post_id);
    db.post.update_or_insert(
        (db.post.post_author == u) & (db.post.id==post_id),
        post_content = request.vars.post_content,
    )
    return "ok"

@auth.requires_signature()
def get_title_reply():
    u = get_user_email()
    t = db(db.reply.reply_author == u).select().first()
    return response.json(dict(reply_content=t.reply_content or ""))

@auth.requires_signature()
def edit_reply():
    reply_id = int(request.vars.post_id);
    u = get_user_email()
    # print(request.vars.post_content)
    # print(post_id);
    db.reply.update_or_insert(
        (db.reply.reply_author == u) & (db.reply.id==reply_id),
        reply_content = request.vars.reply_content,
    )
    return "ok"

@auth.requires_signature()
def set_join():
    post_id = int(request.vars.post_id)
    join_status = request.vars.join.lower().startswith('t');
    if join_status:
        db.user_join.update_or_insert(
            (db.user_join.post_id == post_id) & (db.user_join.user_email == auth.user.email),
            post_id = post_id,
            user_email = auth.user.email
        )
    else:
        db((db.user_join.post_id == post_id) & (db.user_join.user_email == auth.user.email)).delete()
    return "ok" # Might be useful in debugging.

def get_join():
    """Gets the list of people who liked a post."""
    post_id = int(request.vars.post_id)
    # We get directly the list of all the users who liked the post. 
    rows = db(db.user_join.post_id == post_id).select(db.user_join.user_email)
    # If the user is logged in, we remove the user from the set.
    joined_set = set([r.user_email for r in rows])
    # the if statement is so that you do not display yourself
    # if auth.user:
    #     joined_set -= {auth.user.email}
    joined_list = list(joined_set)
    joined_list.sort()
    # We return this list as a dictionary field, to be consistent with all other calls.
    return response.json(dict(joined=joined_list))


