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
    $(".or_actor_list").append("<option class='"+p.id+"' value="+p.id+">"+name+"</option>");
}

function new_minor(m)
{
    m.type = 'm';
    m.id = 'm'+game.minors.length;
    m.cash = +m.cash;
    m.stock = 0;
    m.shares_pct = [];
    m.shares_pct[m.id] =  100;
    game.minors.push(m);
    game.actors['m'+(game.minors.length-1)] = game.minors[game.minors.length-1];
    $( "<td/>", {
            html: m.name,
            id: m.id+"_name",
            "class": "co_minor "+m.id,
    }).insertBefore("#market_actor");
    $( "<td/>", {
            html: '-',
            id: m.id+"_valuation",
            "class": "co_minor "+m.id,
    }).insertBefore("#market_valuation");
    $( "<td/>", {
            html: '-',
            id: m.id+"_stock",
            "class": "co_minor "+m.id,
    }).insertBefore("#market_stock");
    $( "<td/>", {
            html: 0,
            id: m.id+"_run",
            "class": "co_minor "+m.id,
    }).insertBefore("#market_run");
    $( "<td/>", {
            html: m.cash,
            id: m.id+"_cash",
            "class": "co_minor "+m.id,
    }).insertBefore("#market_cash");
    if (game_cfg.hasOwnProperty('trains')) {
        $( "<td/>", {
                html: m.trains.join(','),
                id: m.id+"_train",
                "class": "co_minor "+m.id,
        }).insertBefore("#market_train");
    }
    $( "<td/>", {
            html: "-",
            "class": "co_minor "+m.id,
    }).insertBefore("#market_income");
    $(".or_actor_list").append("<option class='"+m.id+"' value="+m.id+">"+m.name+"</option>");
    $(".sr_co_list").append("<option class='"+m.id+"' value="+m.id+">"+m.name+"</option>");
    $(".or_co_list").append("<option class='"+m.id+"' value="+m.id+">"+m.name+"</option>");
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
    s.trains = [];
    game.share_co.push(s);
    game.actors[s.id] = s; //game.share_co[game.share_co.length-1];
    game.market.shares[s.id] = '';
    for(var i in game_cfg.market.ipo) {
        var ipo = game_cfg.market.ipo[i];
        if (game_cfg.market.grid[ipo[1]][ipo[0]] == s.par) {
            s.market_loc=[ipo[0],ipo[1]];
            $('#'+ipo[0]+'_'+ipo[1]).append("<div id='"+s.id+"_stock_token' class='"+s.id+"'>"+s.name+"</div>");
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
            html: '',
            id: s.id+"_train",
            "class": "co_"+s.share_count+"_stock "+s.id
    }).insertBefore("#market_train");
    $( "<td/>", {
            html: "$<input size='3' id='"+s.id+"_in' value='0'>",
            id: s.id+"_income",
            "class": "co_"+s.share_count+"_stock "+s.id
    }).insertBefore("#market_income");
    // Remove from share_co_names
    $(".share_co_names .s_"+s.id).remove();
    $(".or_actor_list").append("<option class='"+s.id+"' value="+s.id+">"+s.name+"</option>");
    $(".sr_co_list").append("<option class='"+s.id+"' value="+s.id+">"+s.name+"</option>");
    $(".or_co_list").append("<option class='"+s.id+"' value="+s.id+">"+s.name+"</option>");
    if (game_cfg.cap == 'inc') {
        s.floated = true;
    } else {
        s.floated = false;
        $("."+s.id).addClass('not_floated');
    }
}

function startgame()
{
    $('#game_start').hide();
    $('#market').show();
    $('#stock').show();
    document.title = $('#game_file').val();
    //$.retrieveJSON($('#game_file').val(), function(json){
    $.ajax({
           dataType: "jsonp",
           url: $('#game_file').val(),
           jsonpCallback: 'game_data',
           success: function(json){

    if (game.market.cash != 0) {
        if (game_cfg.ver != json.ver) {
            alert('Updated version available, refresh to restart and use.');
        }
        return; // Already got the cached version, ignore the new.
    }
    game_cfg = json;
    var c;

    if (game_cfg.market.hasOwnProperty('pre_start')) {
        // Something special at start of game.
        var num_players = game.players.length;
        eval(game_cfg.market.pre_start);
    }
    $('#p0_name').append($('<div/>', {
            html: 'Deal',
            id: "sr_deal",
            "class": "deal"
            }));
    var train;
    var phase, count, speed, cost;

    $('.trains').hide();
    if (game_cfg.hasOwnProperty('trains')) {
        $('.trains').show();
        train=$('#train_grid').children().eq(0).children();
        phase=train.eq(0);
        count=train.eq(1);
        speed=train.eq(2);
        cost =train.eq(3);
        $("#or_train_cost").html(game_cfg.trains.stock[0][2][0][1]);
        for(var p in game_cfg.trains.stock) {
            var stock = game_cfg.trains.stock[p];
            phase.append($('<td/>', {colspan:stock[2].length,
                        html: stock[0],
                        class: 'phase_'+stock[0]
            }));
            count.append($('<td/>', {colspan:stock[2].length,
                        html: stock[1],
                        class: 'phase_'+stock[0],
                        id: 'train_'+stock[0]+'_count'
            }));
            for(var t in stock[2]) {
                speed.append($('<td/>', {
                            html: stock[2][t][0],
                            class: 'phase_'+stock[0]
                }));
                cost.append($('<td/>', {
                            html: stock[2][t][1],
                            class: 'phase_'+stock[0]
                }));

                $(".train_types").append("<option class='phase_"+stock[0]+"' value="+stock[2][t][0]+'_'+p+">"+stock[2][t][0]+' $'+stock[2][t][1]+"</option>");
            }
        }
    }
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
        $(".ipo_shares").append("<option class='"+game_cfg.share_count+"' value="+c+">"+game_cfg.share_count+"</option>");
    }
    for(c in game_cfg.share_co) {
        $(".share_co_names").append("<option class='"+game_cfg.share_co[c].id+"' value="+c+">"+game_cfg.share_co[c].name+"</option>");
    }
    for(c in game.players) {
        game.players[c].cash = 0;
        transfer_cash(game.market,game.players[c], game_cfg.player_start_cash[game.players.length]);
    }
    $("#Bank_actor").html('Bank');
    $('#Bank_cash').show();
    $('#Bank_stock').show();
    game.actors['Bank'] = game.market;
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
    $('#pre_start').show();
    $("#special_actions").show();
}});
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
  $("#"+to.id+"_cash").removeClass("error");
  if (to.cash < 0) {
      $("#"+to.id+"_cash").addClass("error");
  }
  $("#"+from.id+"_cash").text(from.cash);
  $("#"+from.id+"_cash").removeClass("error");
  if (from.cash < 0) {
      $("#"+from.id+"_cash").addClass("error");
  }
  if (to.hasOwnProperty("nw")) {
      to.nw += cash;
      $("#"+to.id+"_nw").text(to.nw);
  }
  if (from.hasOwnProperty("nw")) {
      from.nw -= cash;
      $("#"+from.id+"_nw").text(from.nw);
  }
}
function swap_pres(from, to, of)
{
    transfer_share(from, to, 'p', of, 0, "Presidential swap");
    transfer_share(to, from, 'ss', of, 0, "Presidential swap");
    log_entry("** "+to.name+" takes over from "+from.name+" as president of "+game.actors[of].name);
}
// from, to  -- actors
// share     -- what share (type)
// share_of  -- id of company share being transfered
// price     -- $ paid for share
function transfer_share(from, to, shares, share_of, price, why)
{
    var share_idx;
    var skipped = "";
    var share;
    var value = 0;

    if (!to.shares.hasOwnProperty(share_of)) {
        to.shares[share_of] = '';
        to.shares_pct[share_of] = 0;
    }

    for(var s in shares) {
        share = shares.charAt(s);
        share_idx = from.shares[share_of].indexOf(share);
        if (share_idx == -1) {
            skipped +=share;
            shares = shares.slice(0,share_idx)+shares.slice(share_idx+1);
            continue;
        }
        value += share_value(share);
        from.shares[share_of] = from.shares[share_of].slice(0,share_idx) + from.shares[share_of].slice(share_idx+1);
        to.shares[share_of] += share;
    }
    if (skipped) {
        alert("Shares not available: "+skipped);
    }

    to.shares[share_of] = to.shares[share_of].split('').sort(function(a,b){return share_value(b)-share_value(a);}).join('');
    from.shares_pct[share_of] -= (100/game.actors[share_of].share_count)*value;
    to.shares_pct[share_of] += (100/game.actors[share_of].share_count)*value;
    if (share == 'p') {
        if (!game.actors[share_of].hasOwnProperty('president')) {
            log_entry("** "+to.name+" opens "+game.actors[share_of].name+" as president");
        }
        game.actors[share_of].president = to;
    }
    if (to.shares_pct[share_of] > game.actors[share_of].president.shares_pct[share_of]) {
        swap_pres(game.actors[share_of].president, to, share_of);
    }
    if (share_of == from.id && game_cfg.cap == 'full') {
        transfer_cash(to, game.market, value*price); // Company gets $ at float time, share price goes to market.
        if ((game_cfg.cap_float > 0 && from.shares_pct[share_of] <= game_cfg.cap_float) ||
             (game_cfg.cap_float < 0 && from.shares[share_of].length <= -game_cfg.cap_float)
            ) {
            from.floated = true;
            transfer_cash(game.market, game.actors[from.id], from.par*(from.share_count));
            $("."+from.id).removeClass('not_floated');
        }
    } else {
        transfer_cash(to, from, value*price);
    }
    update_stock_ui(from);
    if (from.hasOwnProperty('nw')) {
        player_nw(from);
    }
    update_stock_ui(to);
    if (to.hasOwnProperty('nw')) {
        player_nw(to);
    }
    var l;
    l = to.name+" buys "+shares+" of "+game.actors[share_of].name+" from "+from.name;
    if (price) {
        l+=" @ $"+price+"/share for $"+value*price;
    }
    l+=" for "+why;
    log_entry(l);
}

function transfer_train(from, to, train, price)
{
    var has_train = false;
    train = train.split('_');

    if (from == game.market) {
        if (game_cfg.trains.stock[train[1]][1] == 0) {
            return;
        }
        game_cfg.trains.stock[train[1]][1] -= 1;
    } else {
        $.grep(game.or_order, function(v) { if (v == train[0]) { has_train = true; } return v != train[0]; });
        if (has_train == false) {
            return;
        }
    }
    transfer_cash(to, from, price);
    to.trains.push(train[0]);
    to.trains.sort();
    update_train_ui(from);
    update_train_ui(to);
}

function sr_sell()
{
    var n, price, shares;;
    n = $('#sr_sell_co').val();
    shares = $('#sr_sell_shares').val();
    if (game_cfg.market.hasOwnProperty('sr_sell_pre')) {
        // Something special after selling, execute it.
        var player = game.players[game.sr_current];
        var co = game.actors[n];
        eval(game_cfg.market.sr_sell_pre);
    }
    transfer_share(game.players[game.sr_current], game.market, shares, n, game.actors[n].stock, "SR action");
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
    transfer_share(game.actors[new_co.id], game.players[game.sr_current], 'p', new_co.id, par, "SR ipo action");
    game.sr_passes = 0;
}
function sr_buy()
{
    var n, price, share, from;
    n = $('#sr_buy_co').val();
    from = $('#sr_buy_from').val();
    share = $('#sr_buy_share').val();
    if (from == 'company') {
        transfer_share(game.actors[n], game.players[game.sr_current], share, n, game.actors[n].stock, "SR action");
    } else {
        transfer_share(game.market, game.players[game.sr_current], share, n, game.actors[n].stock, "SR action");
    }
    game.sr_passes = 0;
}
function sr_pass()
{
    game.sr_current ++;
    if (game.sr_current == game.players.length) {
        game.sr_current = 0;
    }
    if (game.sr_passes == game.players.length) {
        if (game_cfg.market.hasOwnProperty('sr_end')) {
            // Something special after selling, execute it.
            eval(game_cfg.market.sr_end);
        }
       log_entry(game.players[game.sr_current].name+" has priority" );
       $('#p'+game.sr_current+'_name').append($('#sr_deal'));
       game.or_id = 0;
       or_start();
    }
    game.sr_passes += 1;
    $("#current_player").text(game.players[game.sr_current]['name']);
}
function sr_start()
{
    if(game.turn_id == 0) {
        // first turn of game, remove minors from sr_co_list
        $('.sr_co_list').children().not('.Bank').remove();
    }
    game.turn_id ++;
    game.sr_current = -1;
    game.mode='s';
    $("#sr_id").text('sr'+game.turn_id);
    sr_pass();
    sr_log();
    $('#pre_start').hide();
    $('#actions>div').hide();
    $("#sr_actions").show();
    $("#special_actions").show();
}

function or_operate()
{
    var h, pay, payout, per_share;
    h = "Operate: -- ";
    pay = $('#or_run_pay').val();
    payout = +$('#or_run_value').val();
    per_share = Math.floor(payout/game.or_actor.share_count);
    h += game.or_actor.name+" operated for $"+per_share+' per share ';
    if (pay == 'full')
    {
       h += 'paying out';
    } else if (pay == 'half') {
       var half = Math.floor(per_share/2)*game.or_actor.share_count;
       h += 'paying half';
       transfer_cash(game.market, game.or_actor, half);
       payout -= half;
       per_share = Math.floor(payout.game.or_actor.share_count);
    } else {
        h += 'holding';
        per_share = 0;
        payout = 0;
    }
    for(var a in game.actors) {
        var t = 0;
        if (!game.actors[a].shares.hasOwnProperty(game.or_actor.id)) {
            continue;
        }
        for(s = 0; s < game.actors[a].shares[game.or_actor.id].length; s++) {
          t += per_share * share_value(game.actors[a].shares[game.or_actor.id].charAt(s));
        }
        transfer_cash(game.market, game.actors[a], t);
    }
    if (game_cfg.market.hasOwnProperty('operate')) {
        // Something special after operating, execute it.
        var co = game.or_actor;
        var share = game.or_actor.stock;
        eval(game_cfg.market.operate);
    }
    move_in_market(game.or_actor,0,0); // Move to end of list
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
    transfer_share(game.market, game.or_actor, shares, game.or_actor.id, 0, "stock buyback");
}
function or_sell()
{
    var h, shares;
    h = "Stock sell: -- ";
    shares = $('#or_sell_shares').val();
    transfer_cash(game.market, game.or_actor, +$('#or_sell').val());
    transfer_share(game.or_actor, game.market, shares, game.or_actor.id, 0, "stock selloff");
}
function or_train()
{
    var h, train, from, price;
    h = "Buy Train: -- ";
    train = $('#or_train_type').val();
    from = $('#or_train_from').val();
    price = +$('#or_train_cost').val();
    transfer_train(game.actors[from], game.or_actor, train, price);
    h += game.or_actor.name+" payed $"+price;
    h += ' to '+game.actors[from].name;
    h += " for "+train.split('_')[0]+" train.";

    $("#log_or_"+game.turn_id+"_"+game.or_id).append($("<li/>", { class: 'log_action special', html: h }));
}
function or_pass()
{
    if ( game.or_order.length == 0) {
       $(".has_run").removeClass('has_run');
       game.or_actor=undefined;
       if ( game.or_id > game.or_max) {
           sr_start();
       } else {
           or_start();
       }
       return;
    }

    if(game.or_actor) {
        $("."+game.or_actor.id).addClass('has_run');
    }
    game.or_actor = game.actors[game.or_order.shift()];
    if ( game.or_order.length == 0) {
        $('#or_pass').hide();
        $('#or_nextsr').show();
        $('#or_nextor').show();
    }
    $("#current_co").text(game.or_actor.name+" ("+game.or_actor.president.name+")");
}
function or_start()
{
    $(".has_run").removeClass('has_run');
    game.or_actor=undefined;
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
function update_stock_ui(actor)
{
  var h = $('#'+actor.id+'_stock');
  var paper = $('<div/>');
  var paper_count = 0;

  h.empty();
  if (actor.type == 's' && actor.shares[actor.id].length != 0)
  {
    h.append($('<div/>', {html:"Par: "+actor.par}));
  }
  if (actor.type == 'p')
  {
    h.append(paper);
  }
  for(c in actor.shares) {
    var l;
    if (actor.shares[c].length == 0) { continue; }
    l = $('<div/>', {html: game.actors[c].name+': '+actor.shares[c]});
    paper_count += actor.shares[c].length;
    if (actor.type == 'p' && actor.shares_pct[c] > game_cfg.co_limit) {
        l.addClass("error");
    }
    h.append(l);
  }
  if (actor.type == 'p')
  {
    paper.html('Paper: '+paper_count);
    if (paper_count > game_cfg.paper_limit[game.players.length]) {
        paper.addClass("error");
    }
  }
}

function update_train_ui(actor)
{
  if (actor == game.market) {
        for(var p in game_cfg.trains.stock) {
            var stock = game_cfg.trains.stock[p];
            $('#train_'+stock[0]+'_count').html(stock[1]);
        }
  } else {
      var h = $('#'+actor.id+'_train');
      h.html(actor.trains.join(','));
  }
}


// Log

function log_entry(h)
{
    var log;
    log = '#log_or_'+game.turn_id+"_"+game.or_id;
    if ( game.mode == 's') {
        log = '#log_sr_'+game.turn_id;
    }
    $(log).append($("<li/>", { class: 'log_action', html: h }));
}

function sr_log()
{
    var h,p, t,l,r;

    // Fold last turn up.
    $("#log li:last-of-type").trigger("click");

    h = "Turn "+game.turn_id+" ";
    for (p in game.players) {
        h += game.players[p].name+": $"+game.players[p].cash+" ";
    }
    for (p in game.share_co) {
        h += game.share_co[p].name+": $"+game.share_co[p].cash+" @$"+game.share_co[p].stock+" ";
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
    log_entry(h);
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
    var h, log;
    log = '#log_or_'+game.turn_id+"_"+game.or_id;
    if ( game.mode == 's') {
        log = '#log_sr_'+game.turn_id;
    }
    h = "Stock redistribution: -- ";
    transfer_share(
       game.actors[$('#sp_share_from').val()],
       game.actors[$('#sp_share_to').val()],
       $('#sp_share').val(),
       $('#sp_share_co').val(),
       0,
       $('#sp_share_why').val());
}
function sp_stock_adj()
{
    var h, c;

    h = "Stock adjustment: -- ";
    c = $('#sp_adj_move').val().split('_');
    move_in_market(game.actors[$('#sp_adj_co').val()],+c[0],+c[1]);
    h += game.actors[$('#sp_adj_co').val()].name+" moved "+$('#sp_adj_move option:selected').text();
    h += " for "+$('#sp_adj_why').val()
    log_entry(h);
}

function sp_close()
{
    var h, c, me;

    me = false;
    c = $('#sp_close_co').val();
    // Remove from all UI elements
    if (game.or_actor == game.actors[c]) {
        me = true;
    }
    $('.'+game.actors[c].id).remove();
    // If share_co add back to list to float.
    if (c.charAt(0) == 's') {
        $(".share_co_names").append("<option class='"+c+"' value="+c.slice(2)+">"+game.actors[c].name+"</option>");
    }
    // Now remove from all game state
    delete game.actors[c];
    $.grep(game.or_order, function(v) { return v != c; });
    for(var a in game.actors) {
        delete game.actors[a].shares[c];
        delete game.actors[a].shares_pct[c];
        update_stock_ui(game.actors[a]);
        if (game.actors[a].hasOwnProperty('nw')) {
            player_nw(game.actors[a]);
        }
    }
    h = "Company close: -- ";
    h += c.name+" closed";
    h += " for "+$('#sp_close_why').val()
    log_entry(h );
    if (me) {
        or_pass();
    }
}

// Used by descriptions to interact with the game.
function left1(c)
{
    left(c,1);
}
function stay(c)
{
    left(c,0);
}
function right1(c)
{
    right(c,1);
}
function right2(c)
{
    right(c,2);
}
function right3(c)
{
    right(c,3);
}
function left(c,n)
{
    move_in_market(c,-n,0);
}
function right(c,n)
{
    move_in_market(c,n,0);
}
function is_president(c,p)
{
    if (p.shares[c.id].indexOf('p') != -1) {
        return true;
    }
    return false;
}
function is_share_co(c)
{
    if (c.type == 's') {
        return true;
    }
    return false;
}
function each_in_market(f)
{
    for (var p in game.share_co) {
        var co = game.share_co[p];
        if (game.market.shares[co.id] != '')
        {
            f(co);
        }
    }
}
function each_soldout(f)
{
    for (var p in game.share_co) {
        var co = game.share_co[p];
        if ((co.shares[co.id] == '') && (game.market.shares[co.id] == ''))
        {
            f(co);
        }
    }
}
