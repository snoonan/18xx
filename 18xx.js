var game_cfg = {"ver":-1};

var game  = {
    players: [],
    minors:  [],
    share_co: [],
    actors: {},
    market: {shares: {}, shares_pct: {}, cash:0, id:'Bank',name: 'Bank'},
    or_max: 2,
    turn_id: 1,
    or_id: 1,
    or_order: [],
    sr_current: 0,
    sr_passes: 0,
    eat_comma: 0
};

function addplayer() {
    var name, p;

    name = $("#actor_name").val();
    game.players.push({name: name, type: 'p', id: 'p'+game.players.length, nw: 0, cash: 0, shares: {}, shares_pct:{}});
    p = game.players[game.players.length-1];
    game.actors['p'+(game.players.length-1)] = p
    $( "<td/>", {
            html: name,
            id: p.id+"_name",
    }).insertBefore("#Bank_actor");
    $( "<td/>", {
            html: '-',
            id: p.id+"_nw",
    }).insertBefore("#Bank_nw");
    $( "<td/>", {
            html: '-',
            id: p.id+"_cash",
    }).insertBefore("#Bank_cash");
    $( "<td/>", {
            html: '-',
            id: p.id+"_stock",
    }).insertBefore("#Bank_stock");
    $( "<td/>", {
            html: "$<input size='3' id='"+p.id+"_in' value='0'>",
            id: p.id+"_income",
    }).insertBefore("#Bank_income");
    $(".or_actor_list").append("<option class='p_"+p.id+"' value="+p.id+">"+name+"</option>");
}

function new_minor(m)
{
    m.type = 'm';
    m.id = 'm'+game.minors.length;
    m.cash = +m.cash;
    game.minors.push(m);
    game.actors['m'+(game.minors.length-1)] = game.minors[game.minors.length-1];
    $( "<td/>", {
            html: m.name,
            id: m.id+"_name",
            "class": "co_minor",
    }).insertBefore("#market_actor");
    $( "<td/>", {
            html: '-',
            id: m.id+"_valuation",
            "class": "co_minor",
    }).insertBefore("#market_valuation");
    $( "<td/>", {
            html: '-',
            id: m.id+"_stock",
            "class": "co_minor",
    }).insertBefore("#market_stock");
    $( "<td/>", {
            html: 0,
            id: m.id+"_run",
            "class": "co_minor",
    }).insertBefore("#market_run");
    $( "<td/>", {
            html: m.cash,
            id: m.id+"_cash",
            "class": "co_minor",
    }).insertBefore("#market_cash");
    $( "<td/>", {
            html: "-",
    }).insertBefore("#market_income");
    $(".or_actor_list").append("<option class='m_"+m.id+"' value="+m.id+">"+m.name+"</option>");
}

function move_in_market(s,x,y)
{
    var mark, move_direction;
    if (x > 0 || (x == 0 && y < 0)) {
        move_direction = 'stock_rising';
    } else {
        move_direction = 'stock_falling';
    }
    game.or_order_market[s.market_loc[1]][s.market_loc[0]].splice(game.or_order_market[s.market_loc[1]][s.market_loc[0]].indexOf(s.id),1);
    s.market_loc[0] += x;
    s.market_loc[1] += y;
    s.stock = game_cfg.market.grid[s.market_loc[1]][s.market_loc[0]];
    game.or_order_market[s.market_loc[1]][s.market_loc[0]].push(s.id);
    mark = $('#'+s.id+'_stock_token')
       .addClass(move_direction);
    $('#'+s.market_loc[0]+'_'+s.market_loc[1]).append(mark);
    $('#'+s.id+'_valuation')
       .text(s.stock);
    // Adjust new worth for stock change.
    for(var from in game.players) {
        player_nw(game.players[from]);
    }
}

function new_share_co(s)
{
    s.type = 's';
    s.cash = +s.cash;
    game.share_co.push(s);
    game.actors[s.id] = s; //game.share_co[game.share_co.length-1];
    for(var i in game_cfg.market.ipo) {
        var ipo = game_cfg.market.ipo[i];
        if (game_cfg.market.grid[ipo[1]][ipo[0]] == s.par) {
            s.market_loc=[ipo[0],ipo[1]];
            $('#'+ipo[0]+'_'+ipo[1]).append("<div id='"+s.id+"_stock_token'>"+s.name+"</div>");
            game.or_order_market[s.market_loc[1]][s.market_loc[0]].push(s.id);
        }
    }
    $( "<td/>", {
            html: s.name,
            id: s.id+"_name",
            "class": "co_"+s.share_count+"_stock "+s.id
    }).insertBefore("#market_actor");
    $( "<td/>", {
            html: s.stock,
            id: s.id+"_valuation",
            "class": "co_"+s.share_count+"_stock "+s.id
    }).insertBefore("#market_valuation");
    $( "<td/>", {
            html: s.par+":"+s.shares[s.id],
            id: s.id+"_stock",
            "class": "co_"+s.share_count+"_stock "+s.id
    }).insertBefore("#market_stock");
    $( "<td/>", {
            html: 0,
            id: s.id+"_run",
            "class": "co_"+s.share_count+"_stock "+s.id
    }).insertBefore("#market_run");
    $( "<td/>", {
            html: 0,
            id: s.id+"_cash",
            "class": "co_"+s.share_count+"_stock "+s.id
    }).insertBefore("#market_cash");
    $( "<td/>", {
            html: "$<input size='3' id='"+s.id+"_in' value='0'>",
            id: s.id+"_income",
            "class": "co_"+s.share_count+"_stock "+s.id
    }).insertBefore("#market_income");
    // Remove from share_co_names
    $(".share_co_names .s_"+s.id).remove();
    $(".or_actor_list").append("<option class='s_"+s.id+"' value="+s.id+">"+s.name+"</option>");
    $(".sr_co_list").append("<option class='s_"+s.id+"' value="+s.id+">"+s.name+"</option>");
    if (game_cfg.cap == 'partial') {
        s.floated = true;
    } else {
        s.floated = false;
        $("."+s.id).addClass('not_floated');
    }
}

function startgame()
{
    $('#start').hide();
    $('#game_file').hide();
    document.title = $('#game_file').val();
    $.retrieveJSON($('#game_file').val(), function(json){

    if (game.market.cash != 0) {
        if (game_cfg.ver != json.ver) {
            alert('Updated version available, refresh to restart and use.');
        }
        return; // Already got the cached version, ignore the new.
    }
    game_cfg = json;
    var c;

    for(var r in game_cfg.market.grid) {
        var row;
        row = $("<tr/>");
        for(c in game_cfg.market.grid[r]) {
            // ID is x_y which is reversed for row_col
            row.append("<td id='"+c+"_"+r+"'>"+game_cfg.market.grid[r][c]+"<br></td>");
        }
        $("#stock_grid").append(row);
    }
    if (game_cfg.market.hasOwnProperty('ipo')) {
        for(c in game_cfg.market.ipo) {
            $('#'+game_cfg.market.ipo[c][0]+"_"+game_cfg.market.ipo[c][1]).addClass('ipo');
        }
    }
    if (game_cfg.market.hasOwnProperty('yellow')) {
        for(c in game_cfg.market.yellow) {
            $('#'+game_cfg.market.yellow[c][0]+"_"+game_cfg.market.yellow[c][1]).addClass('yellow');
        }
    }
    if (game_cfg.market.hasOwnProperty('red')) {
        for(c in game_cfg.market.red) {
            $('#'+game_cfg.market.red[c][0]+"_"+game_cfg.market.red[c][1]).addClass('red');
        }
    }
    game.market.cash = game_cfg.bank[game.players.length];
    for(c in game_cfg.minors) {
        new_minor(game_cfg.minors[c]);
    }
    for(c in game_cfg.share_count) {
        $(".ipo_shares").append("<option class='s_"+game_cfg.share_count+"' value="+c+">"+game_cfg.share_count+"</option>");
    }
    for(c in game_cfg.share_co) {
        $(".share_co_names").append("<option class='s_"+game_cfg.share_co[c].id+"' value="+c+">"+game_cfg.share_co[c].name+"</option>");
    }
    for(c in game.players) {
        game.players[c].cash = 0;
        transfer_cash(game.market,game.players[c], game_cfg.player_start_cash[game.players.length]);
    }
    $("#Bank_actor").html('Bank');
    $('#Bank_cash').show();
    $('#Bank_stock').show();
    game.turn_id = 0;
    // Cache market operating order.
    game.or_sort = [];
    game.or_order_market = [];
    {
        var market = [], max; // m[r] = [c,$]
        for(var r in game_cfg.market.grid) {
            market[r] = [game_cfg.market.grid[r].length-1, game_cfg.market.grid[r][game_cfg.market.grid[r].length-1]];
            game.or_order_market[r] = [];
            game.or_order_market[r][game_cfg.market.grid[r].length-1] = [];
        }
        do {
            max = [99,0,0];     // r,c,$
            for(var r in market) {
                if ((market[r][1] > max[2]) || (market[r][1] == max[2] && r > max[0] && market[r][0] > max[1])) {
                    max = [r,market[r][0],market[r][1]];
                }
            }
            if (max[0] == 99)
            {
                continue;
            }
            game.or_sort.push([max[0],max[1]]);
            if (max[1] == 0) {
                market[max[0]] = [0,-1];
            } else {
                market[max[0]] = [max[1]-1, game_cfg.market.grid[max[0]][max[1]-1]];
                game.or_order_market[max[0]][max[1]] = [];
            }
        } while(max[0] != 99);
    }
    sr_start();
});
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
  $("#"+to.id+"_cash").text(to.cash);
  $("#"+from.id+"_cash").text(from.cash);
  if (to.hasOwnProperty("nw")) {
      to.nw += cash;
      $("#"+to.id+"_nw").text(to.nw);
  }
  if (from.hasOwnProperty("nw")) {
      from.nw -= cash;
      $("#"+from.id+"_nw").text(from.nw);
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

    if (share_of == from.id && game_cfg.cap == 'full') {
        transfer_cash(to, game.market, share_value(share)*price); // Company already has the $, share price goes to market.
    } else {
        transfer_cash(to, from, share_value(share)*price);
    }
    from.shares[share_of] =
    from.shares[share_of].slice(0,share_idx) +
    from.shares[share_of].slice(share_idx+1,from.shares[share_of].length);
    from.shares_pct[share_of] -= (100/game.actors[share_of].share_count)*share_value(share);
    if (game_cfg.cap == 'full' &&
        ((game_cfg.cap_float > 0 && from.shares_pct[share_of] <= game_cfg.cap_float) ||
         (game_cfg.cap_float < 0 && from.shares[share_of].length <= -game_cfg.cap_float)
        )) {
        from.floated = true;
        transfer_cash(game.market, game.actors[from.id], from.par*(from.share_count));
        $("."+from.id).removeClass('not_floated');
    }
    update_stock_ui(from);
    if (from.hasOwnProperty('nw')) {
        player_nw(from);
    }
    if (!to.shares.hasOwnProperty(share_of)) {
        to.shares[share_of] = '';
        to.shares_pct[share_of] = 0;
    }
    to.shares[share_of] += share;
    to.shares_pct[share_of] += (100/game.actors[share_of].share_count)*share_value(share);
    update_stock_ui(to);
    if (to.hasOwnProperty('nw')) {
        player_nw(to);
    }
}

function update_stock_ui(actor)
{
  var h = '';
  if (actor.type == 's')
  {
    h = "Par: "+actor.par+"<br>";
  }
  for(c in actor.shares) {
     h += game.actors[c].name+': '+actor.shares[c]+'<br>';
  }
  $('#'+actor.id+'_stock').html(h);
}
function sr_sell()
{
    var n, price, shares;;
    n = $('#sr_sell_co').val();
    shares = $('#sr_sell_shares').val();
    for(var share in shares) {
        transfer_share(game.players[game.sr_current], game.market, shares.charAt(share), n, game.actors[n].stock);
    }
    h = "Sell: -- "+game.players[game.sr_current].name+" sold "+$('#sr_sell_shares').val()+" share to the market for $"+game.actors[n].stock+"/share";
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
    new_co = {name: game_cfg.share_co[n].name, id: game_cfg.share_co[n].id, cash: 0, par:par, stock:par, share_count: s, shares:{}, shares_pct: {}};
    new_share_co(new_co);
    new_co.shares[new_co.id] = co_shares;
    new_co.shares_pct[new_co.id] = 100;
    h = "IPO: -- "+new_co.name+" with "+s+" shares, par at $"+par+" by "+game.players[game.sr_current].name;
    transfer_share(game.actors[new_co.id], game.players[game.sr_current], 'p', new_co.id, par);
    $("#log_sr_"+game.turn_id).append($("<li/>", { class: 'log_action', html: h }));
    game.sr_passes = 0;
}
function sr_buy()
{
    var n, price, share, from;
    n = $('#sr_buy_co').val();
    from = $('#sr_buy_from').val();
    share = $('#sr_buy_share').val();
    if (from == 'company') {
        transfer_share(game.actors[n], game.players[game.sr_current], share, n, game.actors[n].stock);
    } else {
        transfer_share(game.market, game.players[game.sr_current], share, n, game.actors[n].stock);
    }
    h = "Buy: -- "+game.players[game.sr_current].name+" bought a "+share_type(share)+" share of "+game.actors[n].name+" from the "+from+" for $"+game.actors[n].stock*share_value(share);
    $("#log_sr_"+game.turn_id).append($("<li/>", { class: 'log_action', html: h }));
    game.sr_passes = 0;
}
function sr_pass()
{
    game.sr_current ++;
    if (game.sr_current == game.players.length) {
        game.sr_current = 0;
    }
    if (game.sr_passes == game.players.length) {
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
    $('#actions>div').hide();
    $("#sr_actions").show();
    $("#special_actions").show();
}
function or_operate()
{
    var h, pay, per_share;
    h = "Operate: -- ";
    pay = $('#or_run_pay').val();
    per_share = Math.floor(+($('#or_run_value').val()/game.or_actor.share_count));
    h += game.or_actor.name+" operated for $"+per_share+' per share ';
    if (pay == 'full')
    {
       h += 'paying out';
    } else if (pay == 'half') {
       h += 'paying half';
       transfer_cash(game.market, game.or_actor, +$('#or_run_value').val()/2);
       per_share = Math.floor((per_share+1)/2);
    } else {
        h += 'holding';
        per_share = 0;
    }
    for(var a in game.actors) {
        if (!game.actors[a].shares.hasOwnProperty(game.or_actor.id)) {
            continue;
        }
        for(s = 0; s < game.actors[a].shares[game.or_actor.id].length; s++) {
          transfer_cash(game.market, game.actors[a], per_share * share_value(game.actors[a].shares[game.or_actor.id].charAt(s)));
        }
    }
    $('#'+game.or_actor.id+'_run').html($('#or_run_value').val());
    $("#log_or_"+game.turn_id+"_"+game.or_id).append($("<li/>", { class: 'log_action special', html: h }));
}

function or_pay()
{
    var h, to;
    h = "Purchase: -- ";
    to = $('#or_pay_to').val();
    transfer_cash(game.or_actor,game.actors[to], +$('#or_pay').val());
    h += game.or_actor.name+" payed $"+$('#or_pay').val();
    h += " to "+game.actors[$('#or_pay_to').val()].name;
    h += " for "+$('#or_pay_why').val()

    $("#log_or_"+game.turn_id+"_"+game.or_id).append($("<li/>", { class: 'log_action special', html: h }));
}

function or_buy()
{
    var h, shares;
    h = "Buyback: -- ";
    transfer_cash(game.or_actor, game.market, +$('#or_buy').val());
    shares = $('#or_buy_shares').val();
    for(var share in shares) {
        transfer_share(game.market, game.or_actor, shares.charAt(share), game.or_actor.id, 0);
    }
    h += game.or_actor.name+" payed $"+$('#or_buy').val();
    h += " for "+shares+" of stock back from the market.";

    $("#log_or_"+game.turn_id+"_"+game.or_id).append($("<li/>", { class: 'log_action special', html: h }));
}

function or_sell()
{
    var h, shares;
    h = "Stock sell: -- ";
    shares = $('#or_sell_shares').val();
    transfer_cash(game.market, game.or_actor, +$('#or_sell').val());
    for(var share in shares) {
        transfer_share(game.or_actor, game.market, shares.charAt(share), game.or_actor.id, 0);
    }
    h += game.or_actor.name+" was payed $"+$('#or_sell').val();
    h += " for "+shares+" of stock into the market.";

    $("#log_or_"+game.turn_id+"_"+game.or_id).append($("<li/>", { class: 'log_action special', html: h }));
}

function or_pass()
{
    if ( game.or_order.length == 0) {
       if ( game.or_id > game.or_max) {
           sr_start();
       } else {
           or_start();
       }
       return;
    }
    game.or_actor = game.actors[game.or_order.shift()];
    if ( game.or_order.length == 0) {
        $('#or_pass').hide();
        $('#or_nextsr').show();
        $('#or_nextor').show();
    }
    $("#current_co").text(game.or_actor.name);
}

function or_start()
{
    game.or_order = [];
    for (var m in game.minors) {
        game.or_order.push(game.minors[m].id);
    }
    for(var i in game.or_sort) {
        var sort = game.or_sort[i];
        for(var s in game.or_order_market[sort[0]][sort[1]]) {
            var co = game.or_order_market[sort[0]][sort[1]][s];
            if (game.actors[co].floated) {
                game.or_order.push(co);
            }
        }
    }
    game.or_id ++;
    $('#or_pass').show();
    $('#or_nextsr').hide();
    $('#or_nextor').hide();
    $("#or_id").text('or'+game.turn_id+"."+game.or_id);
    $('.stock_rising').removeClass('stock_rising');
    $('.stock_falling').removeClass('stock_falling');
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
      nw += game.actors[c].stock * share_value(p.shares[c].charAt(s));
    }
  }
  p.nw = nw;
  $("#"+p.id+"_nw").text(p.nw);
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
        i = $("#"+game.players[p].id+"_in").val();
        h += game.players[p].name+": $"+i+" ";
        transfer_cash(game.market,game.players[p], +i);
    }
    for (p in game.share_co) {
        i = $("#"+game.share_co[p].id+"_in").val();
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
    var h, log;
    log = '#log_or_'+game.turn_id+"_"+game.or_id;
    if ( game.mode == 's') {
        log = '#log_sr_'+game.turn_id;
    }
    h = "Special payment: -- ";
    transfer_cash(game.actors[$('#sp_pay_from').val()],
                  game.actors[$('#sp_pay_to').val()],
                  +$('#sp_pay').val());
    h += game.actors[$('#sp_pay_from').val()].name+" payed $"+$('#sp_pay').val();
    h += " to "+game.actors[$('#sp_pay_to').val()].name;
    h += " for "+$('#sp_pay_why').val()

    $(log).append($("<li/>", { class: 'log_action', html: h }));
}
function sp_stock()
{
    var h, log, shares;
    log = '#log_or_'+game.turn_id+"_"+game.or_id;
    if ( game.mode == 's') {
        log = '#log_sr_'+game.turn_id;
    }
    h = "Stock redistribution: -- ";
    shares = $('#sp_share').val();
    for(var share in shares) {
        transfer_share(
           game.actors[$('#sp_share_from').val()],
           game.actors[$('#sp_share_to').val()],
           shares.charAt(share),
           $('#sp_share_co').val(),
           0);
    }
    h += game.actors[$('#sp_share_from').val()].name+" gave "+$('#sp_share').val()+" of "+game.actors[$('#sp_share_co').val()].name;
    h += " shares to "+game.actors[$('#sp_share_to').val()].name;
    h += " for "+$('#sp_share_why').val()
    $(log).append($("<li/>", { class: 'log_action', html: h }));
}
function sp_stock_adj()
{
    var h, c, log;

    log = '#log_or_'+game.turn_id+"_"+game.or_id;
    if ( game.mode == 's') {
        log = '#log_sr_'+game.turn_id;
    }
    h = "Stock adjustment: -- ";
    c = $('#sp_adj_move').val().split('_');
    move_in_market(game.actors[$('#sp_adj_co').val()],+c[0],+c[1]);
    h += game.actors[$('#sp_adj_co').val()].name+" moved "+$('#sp_adj_move option:selected').text();
    h += " for "+$('#sp_adj_why').val()
    $(log).append($("<li/>", { class: 'log_action', html: h }));
}
