game_cfg = {
    player_start_cash: [0,0,0,600, 500, 400],
    bank: [0,0,0,6000, 5000, 4000],
    paper_limit: [0,0,0,14, 13, 12],
    minors: [{name:'a',cash:60},{name:'b',cash:60}],
    stock_co: [{name:'Z'},{name:'X'},{name:'C'},{name:'V'}],
};

game  = {
    players: [],
    minors:  [],
    share_co: [],
    market: [],
    ipo: [],
    or_max: 2,
    ipo_stock_count: [10],
    turn_id: 1,
    or_id: 1,
    or_current: 0,
    sr_current: 0,
    sr_last_act: -1,
    eat_comma: 0
};

function addplayer() {
    name = $("#actor_name").val();
    game.players.push({name: name, cash: 0, stock: []})
    $( "<td/>", {
            html: name,
            id: name+"_name",
            "class": "new",
    }).insertBefore("#add_actor");
    $( "<td/>", {
            html: 0,
            id: name+"_nw",
    }).insertBefore("#add_nw");
    $( "<td/>", {
            html: 0,
            id: name+"_cash",
    }).insertBefore("#add_cash");
    $(".or_payto").append("<option value="+name+">"+name+"</option>");
}

function new_minor(m)
{
    game.minors.push(m);
    $( "<td/>", {
            html: m.name,
            id: m.name+"_name",
            "class": "co_minor",
    }).insertBefore("#market_actor");
    $( "<td/>", {
            html: '-',
            id: m.name+"_valuation",
            "class": "co_minor",
    }).insertBefore("#market_valuation");
    $( "<td/>", {
            html: 0,
            id: m.name+"_run",
            "class": "co_minor",
    }).insertBefore("#market_run");
    $( "<td/>", {
            html: m.cash,
            id: m.name+"_cash",
            "class": "co_minor",
    }).insertBefore("#market_cash");
}

function new_share_co(s)
{
    game.share_co.push(s);
    $( "<td/>", {
            html: name,
            id: name+"_name",
            "class": "new",
    }).insertBefore("#market_actor");
    $( "<td/>", {
            html: 0,
            id: name+"_valuation",
    }).insertBefore("#market_valuation");
    $( "<td/>", {
            html: 0,
            id: name+"_run",
    }).insertBefore("#market_run");
    $( "<td/>", {
            html: 0,
            id: name+"_cash",
    }).insertBefore("#market_cash");
    $(".or_payto").append("<option value="+name+">"+name+"</option>");
}

function startgame() {
    var c;

    for(c in game_cfg.minors) {
        new_minor(game_cfg.minors[c]);
    }
    for(c in game_cfg.stock_co) {
        $(".share_co_names").append("<option value="+game_cfg.stock_co[c].name+">"+game_cfg.stock_co[c].name+"</option>");
    }
    for(c in game.players) {
        player_cash(c, game_cfg.player_start_cash[game.players.length]);
    }
    $("#add_actor").hide();
    game.turn_id = 0;
    sr_start();
}

function sr_pass() {
    if (game.sr_current == game.players.length) {
        game.sr_current = 0;
    }
    if (game.sr_current == game.sr_last_act)
    {
        game.or_id = 0;
        or_start();
    }
    if (game.sr_last_act == -1) {
        // initial condition
        game.sr_last_act = 0;
    }
    $("#current_player").text(game.players[game.sr_current]['name']);
    game.sr_current ++;
}

function sr_start() {
    game.turn_id ++;
    game.mode='s';
    $("#sr_id").text('sr'+game.turn_id);
    sr_pass();
    sr_log();
    $('#actions>ul>li').hide()
    $("#sr_actions").show()
}

function or_pass() {
    var id = game.or_current;
    var actor = "minors";

    if (id >= game.minors.length) {
        id -= game.minors.length;
        actor = "share_co";
    }
    if (actor == "share_co" && id == game.share_co.length)
    {
        if ( game.or_id > game.or_max) {
            sr_start();
        } else {
            or_start();
        }
        return;
    }
    $("#current_co").text(game[actor][id]['name']);
    game.or_current ++;
}

function or_start() {
    game.or_id ++;
    game.or_current = 0;
    $("#or_id").text('or'+game.turn_id+"."+game.or_id);
    game.mode='o';
    or_pass();
    or_log();
    $('#actions>ul>li').hide()
    $("#or_actions").show()
}

// Table maintainence

// p = player index
// c = cash to add
function player_cash(p, c)
{
  game.players[p].cash += c;
  game.players[p].nw += c;
  $("#"+game.players[p].name+"_cash").text(game.players[p].cash);
  $("#"+game.players[p].name+"_nw").text(game.players[p].nw);
}

// Log

function sr_log()
{
    var h,p;

    h = "SR"+game.turn_id+" ";
    for (p in game.players) {
        h += game.players[p].name+": $"+game.players[p].cash+" ";
    }
    for (p in game.share_co) {
        h += game.share_co[p].name+": $"+game.share_co[p].valuation+" ";
    }
    $("#log_turns").append($("<li/>", { class: 'log_turn', id:"log_sr"+game.turn_id, html: h }));
}

function or_log()
{
    $("#log_turns").append($("<li/>", { class: 'log_turn', html: "OR"+game.turn_id+"."+game.or_id, id:"log_sr"+game.turn_id}));
}

// UI functions
$('.log_turns ul').hide();

$('.log_turn').on('click', function() {
    $(this).next('ul.log_rounds').slideToggle();
});

$('.log_round').on('click', function() {
    $(this).next('ul.log_action').slideToggle();
});

