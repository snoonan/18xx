var game_cfg = {
    player_start_cash: [0,900,0,600, 500, 400],
    bank: [0,10000,0,6000, 5000, 4000],
    paper_limit: [0,10,0,14, 13, 12],
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
    market: {shares: {}, shares_pct: {}, cash:0, name: 'Bank'},
    or_max: 2,
    turn_id: 1,
    or_id: 1,
    or_current: 0,
    sr_current: 0,
    sr_passes: 0,
    eat_comma: 0
};

function addplayer() {
    var name;

    name = $("#actor_name").val();
    game.players.push({name: name, type: 'p', nw: 0, cash: 0, shares: {}, shares_pct:{}});
    game.actors['p'+game.players.length-1] = game.players[game.players.length-1];
    $( "<td/>", {
            html: name,
            id: name+"_name",
            "class": "new",
    }).insertBefore("#Bank_actor");
    $( "<td/>", {
            html: '-',
            id: name+"_nw",
    }).insertBefore("#Bank_nw");
    $( "<td/>", {
            html: '-',
            id: name+"_cash",
    }).insertBefore("#Bank_cash");
    $( "<td/>", {
            html: '-',
            id: name+"_stock",
    }).insertBefore("#Bank_stock");
    $( "<td/>", {
            html: "$<input size='3' id='"+name+"_in' value='0'>",
            id: name+"_income",
    }).insertBefore("#Bank_income");
    $(".or_actor_list").append("<option class='p_"+name+"' value=p"+(game.players.length-1)+">"+name+"</option>");
}

function new_minor(m)
{
    m.type = 'm';
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
            id: m.name+"_stock",
            "class": "co_minor",
    }).insertBefore("#market_stock");
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
    $(".or_actor_list").append("<option class='m_"+m.name+"' value=m"+(game.minors.length-1)+">"+m.name+"</option>");
}

function new_share_co(s)
{
    s.type = 's';
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
            id: s.name+"_stock",
            "class": "co_"+s.shares+"_stock"
    }).insertBefore("#market_stock");
    $( "<td/>", {
            html: 0,
            id: s.name+"_run",
            "class": "co_"+s.shares+"_stock"
    }).insertBefore("#market_run");
    $( "<td/>", {
            html: 0,
            id: s.name+"_cash",
            "class": "co_"+s.shares+"_stock"
    }).insertBefore("#market_cash");
    $( "<td/>", {
            html: "$<input size='3' id='"+s.name+"_in' value='0'>",
            id: s.name+"_income",
            "class": "co_"+s.shares+"_stock"
    }).insertBefore("#market_income");
    // Remove from share_co_names
    $(".share_co_names option .s_"+s.name).remove();
    $(".or_actor_list").append("<option class='s_"+s.name+"' value=s"+(game.share_co.length-1)+">"+s.name+"</option>");
    $(".sr_co_list").append("<option class='s_"+s.name+"' value=s"+(game.share_co.length-1)+">"+s.name+"</option>");
}

function startgame()
{
    var c;

    game.market.cash = game_cfg.bank[game.players.length];
    for(c in game_cfg.minors) {
        new_minor(game_cfg.minors[c]);
    }
    for(c in game_cfg.share_co) {
        $(".share_co_names").append("<option class='s_"+game_cfg.share_co[c].name+"' value="+c+">"+game_cfg.share_co[c].name+"</option>");
    }
    for(c in game.players) {
        transfer_cash(game.market,game.players[c], game_cfg.player_start_cash[game.players.length]);
    }
    $("#Bank_actor").html('Bank');
    $('#Bank_cash').show();
    $('#Bank_stock').show();
    game.turn_id = 0;
    sr_start();
}

function share_type(share_type)
{
    if (share_type == 'p') {
        return 'President';
    } else if (share_type == 's') {
        return 'normal';
    } else if (share_type == 'h') {
        return 'half';
    } else if (share_type == 'd') {
        return 'double';
    } else if (share_type == '-') {
        return 'short';
    }
}
// from, to  -- actors
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

// from, to  -- actors
// cash     -- $
function transfer_cash(from, to, cash)
{
  to.cash += cash;
  from.cash -= cash;
  $("#"+to.name+"_cash").text(to.cash);
  $("#"+from.name+"_cash").text(from.cash);
  if (to.hasOwnProperty("nw")) {
      to.nw += cash;
      $("#"+to.name+"_nw").text(to.nw);
  }
  if (from.hasOwnProperty("nw")) {
      from.nw -= cash;
      $("#"+from.name+"_nw").text(from.nw);
  }
}
// from, to  -- actors
// share     -- what share (type)
// share_of  -- id of company share being transfered
// price     -- $ paid for share
function transfer_share(from, to, share, share_of, price)
{
    var share_idx;

    share_idx = from.shares[share_of].indexOf(share);
    if (share_idx == -1) {
        return;
    }

    if (from.hasOwnProperty('par')) {
        transfer_cash(to, game.market, share_value(share)*price); // Company already has the $, share price goes to market.
    } else {
        transfer_cash(to, from, share_value(share)*price);
    }
    from.shares[share_of] =
    from.shares[share_of].slice(0,share_idx) +
    from.shares[share_of].slice(share_idx+1,from.shares[share_of].length);
    from.shares_pct[share_of] += (100/game.share_co[share_of].share_count)*share_value(share);
    update_stock_ui(from);
    if (from.hasOwnProperty('nw')) {
        player_nw(from);
    }
    if (!to.shares.hasOwnProperty(share_of)) {
        to.shares[share_of] = '';
        to.shares_pct[share_of] = 0;
    }
    to.shares[share_of] += share;
    to.shares_pct[share_of] += (100/game.share_co[share_of].share_count)*share_value(share);
    update_stock_ui(to);
    if (to.hasOwnProperty('nw')) {
        player_nw(to);
    }
}

function update_stock_ui(actor)
{
  var h = '';
  if (actor.type == 'p')
  {
    for(c in actor.shares) {
      h += game.share_co[c].name+': '+actor.shares[c]+'<br>';
    }
  } else {
    h = "Par: "+actor.par+"<br>";
    for(c in actor.shares) {
      h += game.share_co[c].name+': '+actor.shares[c]+'<br>';
    }
  }
  $('#'+actor.name+'_stock').html(h);
}

function sr_sell()
{
    var n, price, share;
    n = $('#sr_sell_co').val();
    n = n.slice(1,n.length);
    share = $('#sr_sell_share').val();
    transfer_share(game.players[game.sr_current], game.market, share, n, game.share_co[n].stock);
    h = "Sell: -- "+game.players[game.sr_current].name+" sold a "+share_type(share)+" share to the market for $"+game.share_co[n].stock*share_value(share);
    $("#log_sr_"+game.turn_id).append($("<li/>", { class: 'log_action', html: h }));
    game.sr_passes = 0;
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

    new_co = {name: game_cfg.share_co[n].name, cash: 0, par:par, stock:par, share_count: s, shares:{}, shares_pct: {}};
    new_co.shares[game.share_co.length] = co_shares;
    new_co.shares_pct[game.share_co.length] = 100;
    new_share_co(new_co);
    transfer_share(game.share_co[game.share_co.length-1], game.players[game.sr_current], 'p', game.share_co.length-1, par);
    h = "IPO: -- "+new_co.name+" with "+s+" shares, par at $"+par+" by "+game.players[game.sr_current].name;
    $("#log_sr_"+game.turn_id).append($("<li/>", { class: 'log_action', html: h }));
    game.sr_passes = 0;
}

function sr_buy()
{
    var n, price, share, from;
    n = $('#sr_buy_co').val();
    n = n.slice(1,n.length);
    from = $('#sr_buy_from').val();
    share = $('#sr_buy_share').val();
    if (from == 'company') {
      transfer_share(game.share_co[n], game.players[game.sr_current], share, n, game.share_co[n].stock);
    } else {
      transfer_share(game.market, game.players[game.sr_current], share, n, game.share_co[n].stock);
    }
    h = "Buy: -- "+game.players[game.sr_current].name+" bought a "+share_type(share)+" share of "+game.share_co[n].name+" from the "+from+" for $"+game.share_co[n].stock*share_value(share);
    $("#log_sr_"+game.turn_id).append($("<li/>", { class: 'log_action', html: h }));
    game.sr_passes = 0;
}

function sr_pass()
{
    game.sr_current ++;
    if (game.sr_current == game.players.length) {
        game.sr_current = 0;
    }
    if (game.sr_passes == game.players.length)
    {
        $("#log_sr_"+game.turn_id).append($("<li/>", { class: 'log_action', html: game.players[game.sr_current].name+" has priority" }));
        game.or_id = 0;
        or_start();
    }
    game.sr_passes += 1;
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
    var h, pay, per_share;
    h = "Operate: -- ";
    to = $('#or_run').val();
    pay = $('#or_pay').val();
    per_share = +($('#or_pay').val()/game.or_actor.shares);
    h += game.or_actor.name+" operated for $"+per_shares+' per share ';
    if (pay == 'full') {
        h += 'paying out';
    } else if (pay == 'half') {
        h += 'paying half';
        transfer_cash(game.market, game.or_actor, +$('#or_pay').val()/2);
        per_share = (per_share+1)/2;
    } else {
        h += 'holding';
        per_share = 0;
    }

    $("#log_or_"+game.turn_id+"_"+game.or_id).append($("<li/>", { class: 'log_action special', html: h }));
}

function or_pay()
{
    var h, to;
    h = "Purchase: -- ";
    to = $('#or_pay').val();
    if (to.charAt(0) == 'p') {
      transfer_cash(game.or_actor,game.players[+to.slice(1,to.length)], $('#or_pay').val());
    } else if (to.charAt(0) == 'p') {
      transfer_cash(game.or_actor,game.share_co[+to.slice(1,to.length)], $('#or_pay').val());
    } else if (to.charAt(0) == 'b') {
      transfer_cash(game.or_actor,market, $('#or_pay').val());
    }
    h += game.or_actor.name+" payed $"+$('#or_pay').val();
    h += " to "+game.actor[$('#or_pay_to').val()].name;
    h += " for "+$('#or_pay_why').val()

    $("#log_or_"+game.turn_id+"_"+game.or_id).append($("<li/>", { class: 'log_action special', html: h }));
}

function or_buy()
{
    var h;
    h = "Buyback: -- ";
    transfer_cash(game.or_actor, game.market, -$('#or_buy').val());
    h += game.or_actor.name+" payed $"+$('#or_buy').val();
    h += " for "+$('#or_buy_shares').val()+" of stock back from the market.";

    $("#log_or_"+game.turn_id+"_"+game.or_id).append($("<li/>", { class: 'log_action special', html: h }));
}

function or_sell()
{
    var h;
    h = "Stock sell: -- ";
    transfer_cash(game.market, game.or_actor, $('#or_sell').val());
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

// p = player index
function player_nw(p)
{
  var nw, c, s;

  nw = p.cash;
  for(c in p.shares) {
    for(s = 0; s < p.shares[c].length; s++) {
      nw += game.share_co[c].stock * share_value(p.shares[c].charAt(s));
    }
  }
  p.nw = nw;
  $("#"+p.name+"_nw").text(p.nw);
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
        transfer_cash(game.market,game.players[p], +i);
    }
    for (p in game.share_co) {
        i = $("#"+game.share_co[p].name+"_in").val();
        h += game.share_co[p].name+": $"+i+" ";
        transfer_cash(game.market,game.share_co[p], +i);
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
    transfer_cash(game.actor[$('#sp_pay_from').val()],
                  game.actor[$('#sp_pay_to').val()],
                  $('#sp_pay').val());
    h += game.actor[$('#sp_pay_from').val()].name+" payed $"+$('#sp_pay').val();
    h += " to "+game.actor[$('#sp_pay_to').val()].name;
    h += " for "+$('#sp_pay_why').val()

    $("#log_or_"+game.turn_id+"_"+game.or_id).append($("<li/>", { class: 'log_action special', html: h }));
}
function sp_stock()
{
    $("#log_or_"+game.turn_id+"_"+game.or_id).append($("<li/>", { class: 'log_action', html: h }));
}
