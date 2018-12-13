# Here go your api methods.
import json

FourRound = {
    "round1": {
        "round1": {"player1": "Round 1_1 Player 1", "player2": "Round 1_1 Player2"}, 
        "round2": {"player1": "Round 1_2 Player 1", "player2": "Round 1_2 Player2"}
    }, 
    "round2": {
        "round1": {"player1": "", "player2": ""}
    }, 
    "round3": ""
}

EightRound = {
    "round1": {
        "round1": {"player1": "1 1 1", "player2": "1 1 2"}, 
        "round2": {"player1": "1 2 1", "player2": "1 2 2"}, 
        "round3": {"player1": "1 3 1", "player2": "1 3 2"}, 
        "round4": {"player1": "1 4 1", "player2": "1 4 2"}, 
    }, 
    "round2": {
        "round1": {"player1": "2 1 1", "player2": "2 1 2"}, 
        "round2": {"player1": "2 2 1", "player2": "2 2 2"}
    }, 
    "round3": {
        "round1": {"player1": "3 1 1", "player2": "3 1 2"}
    }, 
    "round4": "Winner"
}

SixteenRound = {
    "round1": {
        "round1": {"player1": "1 1 1", "player2": "1 1 2"}, 
        "round2": {"player1": "1 2 1", "player2": "1 2 2"}, 
        "round3": {"player1": "1 3 1", "player2": "1 3 2"}, 
        "round4": {"player1": "1 4 1", "player2": "1 4 2"}, 
        "round5": {"player1": "1 5 1", "player2": "1 5 2"}, 
        "round6": {"player1": "1 6 1", "player2": "1 6 2"}, 
        "round7": {"player1": "1 7 1", "player2": "1 7 2"}, 
        "round8": {"player1": "1 8 1", "player2": "1 8 2"}
    }, 
    "round2": {
        "round1": {"player1": "2 1 1", "player2": "2 1 2"}, 
        "round2": {"player1": "2 2 1", "player2": "2 2 2"}, 
        "round3": {"player1": "2 3 1", "player2": "2 3 2"}, 
        "round4": {"player1": "2 4 1", "player2": "2 4 2"}
    }, 
    "round3": {
        "round1": {"player1": "3 1 1", "player2": "3 1 2"}, 
        "round2": {"player1": "3 2 1", "player2": "3 2 2"}
    }, 
    "round4": {
        "round1": {"player1": "4 1 1", "player2": "4 1 2"}
    },
    "round5": "WINNER"
}


@auth.requires_signature()
def add_post():
    s = request.vars.post_format
    temp = ""
    if s == "Best of 3": 
        temp = FourRound
    elif s == "Best of 5":
        temp = EightRound
    elif s == "Best of 7":
        temp = SixteenRound
    else:
        temp = FourRound
    #Default is 4 round
    
    post_id = db.post.insert(
        post_title=request.vars.post_title,
        post_content=request.vars.post_content,
        post_date = request.vars.post_date,
        post_format = request.vars.post_format, 
        matches = ["player1", "player2", "winner"],
        match_info = json.dumps(temp)
    )
    # We return the id of the new post, so we can insert it along all the others.
    return response.json(dict(post_id=post_id))


def get_post_list():
    results = []
    if auth.user is None:
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
                matches = row.matches, 
                match_info = row.match_info
                # counter = tu
            ))
    else:
        # Logged in.
        rows = db().select(db.post.ALL, db.user_join.ALL,
                        left=[
                                db.user_join.on((db.user_join.post_id == db.post.id) & (db.user_join.user_email == auth.user.email)),
                            ],
                            orderby=~db.post.post_time)
        for row in rows:
            tu = db((db.user_join.post_id == row.post.id)).select('user_email')
            print(tu)
            results.append(dict(
                id=row.post.id,
                post_title=row.post.post_title,
                post_content=row.post.post_content,
                post_author=row.post.post_author,
                post_date= row.post.post_date,
                post_format= row.post.post_format,
                post_users= (db((db.user_join.post_id == row.post.id)).select("user_email")),
                matches = row.post.matches,
                match_info = row.post.match_info
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

def updateMatches():
    post_id = int(request.vars.post_id)
    match = json.loads(request.vars.match_info)
    db(db.post.id == post_id).update(match_info = json.dumps(match))
    return "success"

@auth.requires_signature()
def set_join():
    post_id = int(request.vars.post_id)
    join_status = request.vars.join.lower().startswith('t')
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
    # rows = db(db.user_join.post_id == post_id).select(db.user_join.user_email)
    rows = db(db.user_join.post_id == post_id).select()

    # If the user is logged in, we remove the user from the set.
    joined_set = set([r for r in rows])
    # the if statement is so that you do not display yourself
    # if auth.user:
    #     joined_set -= {auth.user.email}
    joined_list = list(joined_set)
    joined_list.sort()
    # We return this list as a dictionary field, to be consistent with all other calls.
    return response.json(dict(joined=joined_list))

def getMatches():
    post_id = int(request.vars.post_id)
    rows = db(db.post.id == post_id).select().first()
    return response.json(dict(d = json.loads(rows.match_info)))
