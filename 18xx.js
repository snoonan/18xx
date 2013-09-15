var game_cfg = {
    player_start_cash: [0,0,0,600, 500, 400],
    bank: [0,0,0,6000, 5000, 4000],
    paper_limit: [0,0,0,14, 13, 12],
    minors: [{name:'a',cash:60},{name:'b',cash:60}],
    share_co: [{name:'Z'},{name:'X'},{name:'C'},{name:'V'}],
    shares: ['pssssssss'],
    share_count: [10],
    eat_comma: 0
};

var game  = {
    players: [],
    minors:  [],
    share_co: [],
    actors: {},
    market: [],
    ipo: [],
    or_max: 2,
    turn_id: 1,
    or_id: 1,
    or_current: 0,
    sr_current: 0,
    sr_last_act: -1,
    eat_comma: 0
};

function addplayer() {
    name = $("#actor_name").val();
    game.players.push({name: name, nw: 0, cash: 0, shares: []})
    game.actors['p'+game.players.length-1] = game.players[game.players.length-1];
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
    $(".or_actor_list").append("<option value=p"+(game.players.length-1)+">"+name+"</option>");
}

function new_minor(m)
{
    game.minors.push(m);
    game.actors['m'+game.minors.length-1] = game.minors[game.minors.length-1];
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
            html: '-',
            id: m.name+"_ipo",
            "class": "co_minor",
    }).insertBefore("#market_ipo");
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
    $(".or_actor_list").append("<option value=m"+(game.minors.length-1)+">"+m.name+"</option>");
}

function new_share_co(s)
{
    game.share_co.push(s);
    game.actors['s'+game.share_co.length-1] = game.share_co[game.share_co.length-1];
    $( "<td/>", {
            html: s.name,
            id: name+"_name",
            "class": "co_"+s.shares+"_stock"
    }).insertBefore("#market_actor");
    $( "<td/>", {
            html: s.stock,
            id: name+"_valuation",
            "class": "co_"+s.shares+"_stock"
    }).insertBefore("#market_valuation");
    $( "<td/>", {
            html: s.par+":"+s.shares[s.name],
            id: s.name+"_ipo",
            "class": "co_"+s.shares+"_stock"
    }).insertBefore("#market_ipo");
    $( "<td/>", {
            html: 0,
            id: name+"_run",
            "class": "co_"+s.shares+"_stock"
    }).insertBefore("#market_run");
    $( "<td/>", {
            html: 0,
            id: name+"_cash",
            "class": "co_"+s.shares+"_stock"
    }).insertBefore("#market_cash");
    $( "<td/>", {
            html: "$<input size='3' id="+name+"_in>",
            id: name+"_income",
            "class": "co_"+s.shares+"_stock"
    }).insertBefore("#market_income");
    // Remove from share_co_names
    //$(".or_actor_list").append("<option value=s"+(game.share_co.length-1)+">"+s.name+"</option>");
    $(".or_actor_list").append("<option value=s"+(game.share_co.length-1)+">"+s.name+"</option>");
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
        actor_cash(game.players[c], game_cfg.player_start_cash[game.players.length]);
    }
    $("#add_actor").hide();
    game.turn_id = 0;
    sr_start();
}

function share_value(share_type)
{
    if (share_type == 'p') {
        return 2;
    } else if (share_type == 's') {
        return 1;
    } else if (share_type == 'h') {
        return 0.5;
    } else if (share_type == 'd') {
        return 2;
    } else if (share_type == '-') {
        return -1;
    }
}
function buy_share(player_no, share, share_of, from_where)
{
    var cost, share_idx;
    // from_where 0=ipo/company, 1=market
    // player_no is <0 then is a share_co
    if (from_where == 0) {
        share_idx = game.share_co[share_of].shares.indexOf(share);
        if (share_idx == -1) {
            return;
        }
        game.share_co[share_of].shares.splice(share_idx,1);
        if (game_cfg.fullcap) {
            cost = share_val(share)*game.share_co[share_of].par;
        } else {
            cost = share_val(share)*game.share_co[share_of].stock;
        }
        $('#'+game.share_co[share_of].name+'_ipo').html(game.share_co[share_of].par+":"+game.share_co[share_of].shares[s.name]);
    } else if (from_where == 1) {
        share_idx = game.share_co[share_of].market.indexOf(share);
        if (share_idx == -1) {
            return;
        }
        game.share_co[share_of].market.splice(share_idx,1);
        cost = share_val(share)*game.share_co[share_of].stock;
        $('#'+game.share_co[share_of].name+'_market').html(game.share_co[share_of].par+":"+game.share_co[share_of].shares[s.name]);
    }
    if (player_no >= 0) {
        if (!game.players[player_no].shares.hasOwnProperty(share_of)) {
            game.players[player_no].shares[share_of] = {}
            game.players[player_no].shares_pct[share_of] = 0;
        }
        game.players[player_no].shares[share_of].append(share);
        game.players[player_no].shares_pct[share_of] += game.share_co[share_of].share_count*share_value(share);
        actor_cash(game.players[player_no], -cost);
        player_nw(player_no);
    } else {
        if (!game.share_co[(-player_no) -1].shares.hasOwnProperty(share_of)) {
            game.share_co[(-player_no) -1].shares[share_of] = {}
            game.share_co[(-player_no) -1].shares_pct[share_of] = 0;
        }
        game.share_co[(-player_no) - 1].shares[share_of].append(share);
        game.share_co[(-player_no) - 1].shares_pct[share_of] += game.share_co[share_of].share_count*share_value(share);
        actor_cash(game.share_co[p], -cost);
    }
}

function sr_sell()
{
}

function sr_ipo()
{
    var n, par, s, h, co_shares, new_co;
    n = $('#ipo_co').val();
    par = +$('#ipo_price').val();
    s = +$('#ipo_shares').val();
    s = 10;
    s_idx = 0;
    co_shares = game_cfg.shares[s_idx];

    new_co = {name: game_cfg.share_co[n].name, par:par, stock:par, shares:{}};
    new_co.shares[game_cfg.share_co[n].name] = co_shares;
    new_share_co(new_co);
    buy_share(game.sr_current, 'p', game.share_co[n].name, 0);
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
    game.sr_current = -1;
    game.mode='s';
    $("#sr_id").text('sr'+game.turn_id);
    sr_pass();
    sr_log();
    $('#actions>div').hide()
    $("#sr_actions").show()
    $("#special_actions").show()
}

function or_operate()
{
}

function or_pay()
{
    var h;
    h = "Purchase: -- ";
    actor_cash(game.or_actor, -$('#or_pay').val());
    actor_cash(game.actor[$('#or_pay_to').val()], $('#or_pay').val());
    h += game.actor[$('#or_pay_from').val()].name+" payed $"+$('#or_pay').val();
    h += " to "+game.actor[$('#or_pay_to').val()].name;
    h += " for "+$('#or_pay_why').val()

    $("#log_or_"+game.turn_id+"_"+game.or_id).append($("<li/>", { class: 'log_action special', html: h }));
}

function or_buy()
{
    var h;
    h = "Buyback: -- ";
    actor_cash(game.or_actor, -$('#or_buy').val());
    h += game.or_actor.name+" payed $"+$('#or_buy').val();
    h += " for "+$('#or_buy_shares').val()+" of stock back from the market.";

    $("#log_or_"+game.turn_id+"_"+game.or_id).append($("<li/>", { class: 'log_action special', html: h }));
}

function or_sell()
{
    var h;
    h = "Stock sell: -- ";
    actor_cash(game.or_actor, $('#or_sell').val());
    h += game.or_actor.name+" was payed $"+$('#or_sell').val();
    h += " for "+$('#or_sell_shares').val()+" of stock into the market.";

    $("#log_or_"+game.turn_id+"_"+game.or_id).append($("<li/>", { class: 'log_action special', html: h }));
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
    game.or_actor = game[actor][id];
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
    $("#special_actions").show()
}

// Table maintainence

// a = actor object
// c = cash to add
function actor_cash(a, c)
{
  a.cash += c;
  $("#"+a.name+"_cash").text(a.cash);
  if (a.hasOwnProperty("nw")) {
      a.nw += c;
      $("#"+a.name+"_nw").text(a.nw);
  }
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
        actor_cash(game.players[p], +i);
    }
    for (p in game.share_co) {
        i = $("#"+game.share_co[p].name+"_in").val();
        h += game.share_co[p].name+": $"+i+" ";
        actor_cash(game.share_co[p], +i);
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

function sp_pay()
{
    var h;
    h = "Special payment: -- ";
    actor_cash(game.actor[$('#sp_pay_from').val()], -$('#sp_pay').val());
    actor_cash(game.actor[$('#sp_pay_to').val()], $('#sp_pay').val());
    h += game.actor[$('#sp_pay_from').val()].name+" payed $"+$('#sp_pay').val();
    h += " to "+game.actor[$('#sp_pay_to').val()].name;
    h += " for "+$('#sp_pay_why').val()

    $("#log_or_"+game.turn_id+"_"+game.or_id).append($("<li/>", { class: 'log_action special', html: h }));
}
function sp_stock()
{
    $("#log_or_"+game.turn_id+"_"+game.or_id).append($("<li/>", { class: 'log_action', html: h }));
}
