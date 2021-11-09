$(document).ready(function() {
  clean();
  generate_initial_table();
});

$(function() {
  $("#words").submit(function(e) {
    var inputWord = $("#register_words");
    let result = [];

    inputWord
      .val()
      .split(" ")
      .forEach(word => result.push(!test_word(word)));

    if (!result.some(word => word === false)) {
      generate_submitForm();
      register_state();
      Tabela = generate_lines();
      table_html(Tabela);
      inputWord.val("");
      e.preventDefault();
      return false;
    } else {
      alert('"' + inputWord.val() + '"' + " não faz parte da gramática!");
      clean();
    }
  });

  $("#getWords").keyup(function(e) {
    if (Tabela.length > 0) {
      valida_palavra(e);
    }
  });
});

function test_word(word) {
  let exprRegular = /([^A-Za-z_])+$/;
  if (exprRegular.test(word)) {
    return true;
  }
  return false;
}

function register_state() {
  for (var i = 0; i < words.length; i++) {
    var actually_state = 0;
    var palavra_vetor = words[i];
    for (var j = 0; j < palavra_vetor.length; j++) {
      if (typeof states[actually_state][palavra_vetor[j]] === "undefined") {
        var next_state = statesGlobal + 1;
        states[actually_state][palavra_vetor[j]] = next_state;
        states[next_state] = [];
        statesGlobal = actually_state = next_state;
      } else {
        actually_state = states[actually_state][palavra_vetor[j]];
      }
      if (j == palavra_vetor.length - 1) {
        states[actually_state]["final"] = true;
      }
    }
  }
}

function generate_lines() {
  var vetor_states = [];
  for (var i = 0; i < states.length; i++) {
    var aux = [];
    aux["states"] = i;
    var primeiro = "a";
    var ultimo = "z";
    for (var j = primeiro.charCodeAt(0); j <= ultimo.charCodeAt(0); j++) {
      var letra = String.fromCharCode(j);
      if (typeof states[i][letra] === "undefined") {
        aux[letra] = "-";
      } else {
        aux[letra] = states[i][letra];
      }
    }
    if (typeof states[i]["final"] !== "undefined") {
      aux["final"] = true;
    }
    vetor_states.push(aux);
  }
  return vetor_states;
}

function generate_submitForm() {
  var palavras = $("#register_words").val();
  var $save_word = $("#save-words ul");
  palavras = palavras.toLowerCase();
  palavras = palavras.split(" ");

  palavras.forEach(palavra => {
    if (words.indexOf(palavra) < 0 && palavra.length > 0) {
      $save_word.append(`<li>${palavra}</li>`);
      words.push(palavra);
    }
  });
}

var words = [];
var states = [[]];
var statesGlobal = 0;
var statesIteracao = [0];
var Tabela = [];

function table_html(vetor_states) {
  tabela = $("#automato");
  tabela.html("");

  var tr = $(document.createElement("tr"));
  var th = $(document.createElement("th"));
  th.html("Estado");
  tr.append(th);
  var primeiro = "a";
  var ultimo = "z";
  for (var j = primeiro.charCodeAt(0); j <= ultimo.charCodeAt(0); j++) {
    var th = $(document.createElement("th"));
    th.html(String.fromCharCode(j));
    tr.append(th);
  }
  tabela.append(tr);

  for (var i = 0; i < vetor_states.length; i++) {
    var tr = $(document.createElement("tr"));
    var td = $(document.createElement("td"));
    tr.addClass("tr-ex");
    if (vetor_states[i]["final"]) {
      td.html("q" + vetor_states[i]["states"] + "*");
    } else {
      td.html("q" + vetor_states[i]["states"]);
    }
    tr.append(td);
    tr.addClass("states_" + vetor_states[i]["states"]);
    var primeiro = "a";
    var ultimo = "z";
    for (var j = primeiro.charCodeAt(0); j <= ultimo.charCodeAt(0); j++) {
      var letra = String.fromCharCode(j);
      var td = $(document.createElement("td"));
      td.addClass("letra_" + letra);
      if (vetor_states[i][letra] != "-") {
        td.html("q" + vetor_states[i][letra]);
        td.css("background", "#000");
        td.css("color", "#fff");
      } else {
        td.html("&");
      }
      tr.append(td);
    }
    tabela.append(tr);
  }
}

function valida_palavra() {
  var primeiro = "a";
  var ultimo = "z";
  var palavras = $("#getWords").val();
  if (palavras.length == 0) {
    $("#getWords").removeClass("acerto");
    $("#getWords").removeClass("erro");
    $("#automato tr").removeClass("states_selecionado");
    $("#automato td").removeClass("letra_selecionada");
  }

  var states = 0;
  for (var i = 0; i < palavras.length; i++) {
    if (
      palavras[i].charCodeAt(0) >= primeiro.charCodeAt(0) &&
      palavras[i].charCodeAt(0) <= ultimo.charCodeAt(0)
    ) {
      line_column_highlight(states, palavras[i]);
      if (Tabela[states][palavras[i]] != "-") {
        states = Tabela[states][palavras[i]];
        set_valid();
      } else {
        set_error();
        break;
      }
    } else if (palavras[i] == " ") {
      line_column_highlight(states, palavras[i]);
      if (Tabela[states]["final"]) {
        states = 0;
        $("#getWords").val("");
      } else {
        set_error();
        break;
      }
    } else {
      alert("Caractere não suportado: " + palavras[i]);
      break;
    }
  }
}

function set_error() {
  $("#getWords").removeClass("acerto");
  $("#getWords").addClass("erro");
}

function set_valid() {
  $("#getWords").addClass("acerto");
  $("#getWords").removeClass("erro");
}

function line_column_highlight(state, letter) {
  $("#automato tr").removeClass("states_selecionado");
  $("#automato td").removeClass("letra_selecionada");
  $("#automato .states_" + state).addClass("states_selecionado");
  $("#automato .letra_" + letter).addClass("letra_selecionada");
}

function clean() {
  $("#reset").on("click", function() {
    words = [];
    states = [[]];
    statesGlobal = 0;
    statesIteracao = [0];
    Tabela = [];
    $("#save-words").html("");
    var trTrable = $("tr.tr-ex");
    trTrable.html("");
    $("#register_words").val("");
    $("#getWords").val("");
    $("#getWords").removeClass("acerto");
    $("#getWords").removeClass("erro");
  });
}

function generate_initial_table() {
  for (var i = 65; i <= 90; i++) {
    $(".tr-header").append("<th>" + String.fromCharCode(i) + "</th>");
    $(".estado_0").append(`<td class="letra_${String.fromCharCode(i)}" />`);
  }
}
