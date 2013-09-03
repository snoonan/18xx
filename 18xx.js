var game_cfg = {
    player_start_cash: [0,0,0,600, 500, 400],
    bank: [0,0,0,6000, 5000, 4000],
    paper_limit: [0,0,0,14, 13, 12],
    minors: [{name:'a',cash:60},{name:'b',cash:60}],
    share_co: [{name:'Z'},{name:'X'},{name:'C'},{name:'V'}],
    eat_comma: 0
};

var game  = {
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
    game.players.push({name: name, nw: 0, cash: 0, co_stock: [], stock: []})
    $( "<td/>", {
            html: name,
            id: name+"_name",
            "class": "new",
    }).insertBefore("#add_actor");
    $( "<td/>", {
            html: '-',
            id: name+"_nw",
    }).insertBefore("#add_nw");
    $( "<td/>", {
            html: '-',
            id: name+"_cash",
    }).insertBefore("#add_cash");
    $( "<td/>", {
            html: "$<input size='3' id="+name+"_in>",
            id: name+"_income",
    }).insertBefore("#add_income");
    $(".or_payto").append("<option value=p"+(game.players.length-1)+">"+name+"</option>");
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
    $( "<td/>", {
            html: "-",
    }).insertBefore("#market_income");
}

function new_share_co(s)
{
    game.share_co.push(s);
    $( "<td/>", {
            html: s.name,
            id: name+"_name",
            "class": "co_"+s.shares+"_stock"
    }).insertBefore("#market_actor");
    $( "<td/>", {
            html: s.stock,
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
    $( "<td/>", {
            html: "$<input size='3' id="+name+"_in>",
            id: name+"_income",
    }).insertBefore("#market_income");
    $(".or_payto").append("<option value=s"+(game.share_co.length-1)+">"+name+"</option>");
}

function startgame()
{
    var c;

    for(c in game_cfg.minors) {
        new_minor(game_cfg.minors[c]);
    }
    for(c in game_cfg.share_co) {
        $(".share_co_names").append("<option value="+c+">"+game_cfg.share_co[c].name+"</option>");
    }
    for(c in game.players) {
        player_cash(c, game_cfg.player_start_cash[game.players.length]);
    }
    $("#add_actor").hide();
    game.turn_id = 0;
    sr_start();
}

// TODO: keep president info
// TODO: 20% share in 10 share co
function buy_share(player_no, count, share_of, from_where)
{
    var cost;
    // from_where 0=ipo, 1=market, 2=company
    // player_no is <0 then is a share_co
    if (from_where == 0) {
        game.share_co[share_of].ipo -= count;
        cost = count*game.share_co[share_of].par;
    } else if (from_where == 1) {
        game.share_co[share_of].market -= count;
        cost = count*game.share_co[share_of].stock;
    } else if (from_where == 2) {
        game.share_co[share_of].self_stock -= count;
        cost = count*game.share_co[share_of].par;
    }
    if (player_no >= 0) {
        game.players[player_no].co_stock[share_of] = (game.players[player_no].co_stock[share_of]||0) + count;
        player_cash(player_no, -cost);
        player_nw(player_no);
    } else {
        game.share_co[(-player_no) - 1].shares[share_of] += count;
        co_cash(p, -cost);
    }
}

function sr_sell()
{
}

function sr_ipo()
{
    var n, par, s, h;
    n = $('#ipo_co').val();
    par = +$('#ipo_price').val();
    s = +$('#ipo_shares').val();
    s = 10;
    new_share_co({name: game_cfg.share_co[n].name, par:par, stock:par, shares:s, ipo:s});
    buy_share(game.sr_current, 2, n, 0);
    h = "IPO: -- "+game.share_co[n].name+" with "+s+" shares, par at $"+par+" by "+game.players[game.sr_current].name;
    $("#log_sr_"+game.turn_id).append($("<li/>", { class: 'log_action', html: h }));
}

function sr_buy()
{
}

function sr_pass()
{
    game.sr_current ++;
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
}

function sr_start()
{
    game.turn_id ++;
    game.mode='s';
    $("#sr_id").text('sr'+game.turn_id);
    sr_pass();
    sr_log();
    $('#actions>div').hide()
    $("#sr_actions").show()
}

function or_pass()
{
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

function or_start()
{
    game.or_id ++;
    game.or_current = 0;
    $("#or_id").text('or'+game.turn_id+"."+game.or_id);
    game.mode='o';
    or_pass();
    or_log();
    or_in_log();
    $('#actions>div').hide()
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

// p = player index
function player_nw(p)
{
  var nw, s;

  nw = game.players[p].cash;
  for(s in game.players[p].co_stock) {
    nw += game.share_co[s].stock * game.players[p].co_stock[s];
  }
  game.players[p].nw = nw;
  $("#"+game.players[p].name+"_nw").text(game.players[p].nw);
}

// p = share_co index
// c = cash to add
function share_co_cash(p, c)
{
  game.share_co[p].cash += c;
  $("#"+game.share_co[p].name+"_cash").text(game.share_co[p].cash);
}

// Log

function sr_log()
{
    var h,p, t,l,r;

    $("#log li:last-of-type").trigger("click");
    h = "Turn "+game.turn_id+" ";
    for (p in game.players) {
        h += game.players[p].name+": $"+game.players[p].cash+" ";
    }
    for (p in game.share_co) {
        h += game.share_co[p].name+": $"+game.share_co[p].stock+" ";
    }
    t = $("<li/>", { class: 'log_turn', id:"log_"+game.turn_id, html: h });
    l = $("<ul/>", { class: 'log_rounds', id:"log_r"+game.turn_id });
    r = $("<li/>", { class: 'log_round', id:"log_"+game.turn_id, html: "SR "+game.turn_id });
    r.append($("<ul/>", {class:"log_actions",id:"log_sr_"+game.turn_id}));
    l.append(r);
    t.append(l);
    $("#log_turns").append(t);
}

function or_log()
{
    var l;
    $("#log_r"+game.turn_id+" li:last-of-type").trigger("click");
    l = $("<li/>", { class: 'log_round', id:"log_or"+game.turn_id+'_'+game.or_id, html: "OR"+game.turn_id+"."+game.or_id });
    l.append($("<ul/>", {class: "log_actions",id:"log_or_"+game.turn_id+"_"+game.or_id}));
    $("#log_r"+game.turn_id).append(l);
}


function or_in_log()
{
    var h,p,i;

    h = "Income: -- ";
    for (p in game.players) {
        i = $("#"+game.players[p].name+"_in").val();
        h += game.players[p].name+": $"+i+" ";
        player_cash(p, +i);
    }
    for (p in game.share_co) {
        i = $("#"+game.share_co[p].name+"_in").val();
        h += game.share_co[p].name+": $"+i+" ";
        share_co_cash(p, +i);
    }
    $("#log_or_"+game.turn_id+"_"+game.or_id).append($("<li/>", { class: 'log_action', html: h }));
}

// UI functions
$('.log_turns ul').hide();

$('#log_turns')
.on('click','li:has(ul)', function(event){
    if (this == event.target) {
        $(this).css('list-style-image',
            (!$(this).children().is(':hidden')) ? 'url(plusbox.gif)' : 'url(minusbox.gif)');
        $(this).children().toggle('slow');
    }
return false;
})
