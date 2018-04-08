'use strict';

function ForlogGrammar() {

  let rules = {};
  this.getRules = function() {
    return rules;
  };

  let variables = {};
  this.getVariables = function() {
    return variables;
  };

  let settings = {
    overrideRules: false,
    keepVariables: false,
    logToConsole: true,
    errorReturnString: 'ERROR'
  };
  this.getSettings = function() {
    return settings;
  };

  let version = '2.0';
  this.getVersion = function() {
    return version;
  };



  // COMMANDS AND COMMAND HELPER FUNCTIONS
  
  let commandUtils = {
    hasEnoughArguments: function(commName, expected, found) {
      if (found < expected) {
        log(`ERROR: not enough arguments in %c${commName}%c command; expected ${expected}, found ${found}`);
        return false;
      }
      return true;
    },
    isInt: function(commName, arg) {
      if (isNaN(parseInt(arg))) {
        log(`ERROR: argument '${arg}' in %c${commName}%c command is not a number`);
        return false;
      }
      return true;
    },
    isNonNegativeInt: function(commName, arg) {
      if (commandUtils.isInt(commName, arg) && parseInt(arg) < 0) {
        log(`ERROR: argument '${arg}' in %c${commName}%c command is not a number ≥ 0'`);
        return false;
      }
      return true;
    },
    isVariableName: function(commName, arg) {
      if (arg.match(/[a-z][A-Za-z0-9_$%&!?]*/) === null) {
        log(`ERROR: argument '${arg}' in %c${commName}%c command is not a valid variable name`);
        return false;
      }
      return true;
    }
  };

  let commands = {
    'set': function(args) {
      if (!commandUtils.hasEnoughArguments('set', 2, args.length) ||
          !commandUtils.isVariableName('set', args[0])) {
        return settings.errorReturnString;
      }
      variables[process(args[0])] = process(args[1]);
      return '';
    },
    'set?': function(args) {
      if (!commandUtils.hasEnoughArguments('set?', 2, args.length) ||
          !commandUtils.isVariableName('set?', args[0])) {
        return settings.errorReturnString;
      }
      if (!variables.hasOwnProperty(args[0])) {
        variables[process(args[0])] = process(args[1]);
      }
      return '';
    },
    'eq': function(args) {
      if (!commandUtils.hasEnoughArguments('eq', 3, args.length) ||
          !commandUtils.isInt('eq', args[0]) ||
          !commandUtils.isInt('eq', args[1])) {
        return settings.errorReturnString;
      }
      if (args[0] == args[1]) {
        return args[2];
      } else if (args.length > 3) {
        return args[3];
      }
      return '';
    },
    'lt': function(args) {
      if (!commandUtils.hasEnoughArguments('lt', 3, args.length) ||
          !commandUtils.isInt('lt', args[0]) ||
          !commandUtils.isInt('lt', args[1])) {
        return settings.errorReturnString;
      }
      if (args[0] < args[1]) {
        return args[2];
      } else if (args.length > 3) {
        return args[3];
      }
      return '';
    },
    'leq': function(args) {
      if (!commandUtils.hasEnoughArguments('leq', 3, args.length) ||
          !commandUtils.isInt('leq', args[0]) ||
          !commandUtils.isInt('leq', args[1])) {
        return settings.errorReturnString;
      }
      if (args[0] <= args[1]) {
        return args[2];
      } else if (args.length > 3) {
        return args[3];
      }
      return '';
    },
    'gt': function(args) {
      if (!commandUtils.hasEnoughArguments('gt', 3, args.length) ||
          !commandUtils.isInt('gt', args[0]) ||
          !commandUtils.isInt('gt', args[1])) {
        return settings.errorReturnString;
      }
      if (args[0] > args[1]) {
        return args[2];
      } else if (args.length > 3) {
        return args[3];
      }
      return '';
    },
    'geq': function(args) {
      if (!commandUtils.hasEnoughArguments('geq', 3, args.length) ||
          !commandUtils.isInt('geq', args[0]) ||
          !commandUtils.isInt('geq', args[1])) {
        return settings.errorReturnString;
      }
      if (args[0] >= args[1]) {
        return args[2];
      } else if (args.length > 3) {
        return args[3];
      }
      return '';
    },
    'for': function(args) {
      if (!commandUtils.hasEnoughArguments('for', 2, args.length) ||
          !commandUtils.isNonNegativeInt('for', args[0])) {
        return settings.errorReturnString;
      }
      return Array(parseInt(args[0])).fill(args[1]).join('');
    },
    'rnd': function(args) {
      if (!commandUtils.hasEnoughArguments('rnd', 2, args.length) ||
          !commandUtils.isInt('rnd', args[0]) ||
          !commandUtils.isInt('rnd', args[0])) {
        return Array(parseInt(args[0])).fill(args[1]).join('');
      }
      return settings.errorReturnString;
    }
  };
  this.getCommands = function() {
    return commands;
  };



  // FUNCTIONS

  this.compileGrammar = compileGrammar;

  function compileGrammar(input) {
    console.groupCollapsed('compiling Forlog grammar');
    let warningCounter = 0;
    let currentRule = 'START_SYMBOL';

    // remove multiline comments
    input = input.replace(/\/\*[^]*?\*\//g, '');

    let lines = input.split('\n');
    for (let i = 0; i < lines.length; ++i) {
      // remove one line comments
      let line = lines[i].replace(/\/\/.*$/, '');
      let match = null;

      // check for new rule
      match = line.match(/^[ \t]*([A-Z][A-Za-z0-9_$%&!?]*)[ \t]*$/);
      if (match !== null) {
        currentRule = match[1];
        if (settings.overrideRules) {
          delete rules[currentRule];
        }
        continue;
      }
      // check for new outcomes
      match = line.match(
        /^[ \t]*(?:#[ \t]*([0-9]*)){0,1}[ \t]*>(.*)$/);
      if (match !== null) {
        let weight = parseInt(match[1]);
        if (isNaN(weight)) {
          weight = 1;
        }
        if (!rules.hasOwnProperty(currentRule)) {
          rules[currentRule] = [];
        }
        while (weight-- > 0) {
          rules[currentRule][rules[currentRule].length] = match[2];
        }
        continue;
      }
      // check for empty lines (not every empty line needs to throw a warning)
      match = line.match(/^[ \t]*$/);
      if (match !== null) {
        continue;
      }
      // handle compile errors
      ++warningCounter;
      log(`line ${i} can not be parsed and is ignored.\nLine ${i}: %c${line.substr(0, 24)}${line.length > 24 ? '...' : ''}`);
    }
    log(`finished compiling; found ${warningCounter} unparsable lines`);
    console.groupEnd();
  }



  this.process = function(input) {
    if (!settings.keepVariables) {
      variables = {};
    }
    return postProcess(process(input));
  };

  function postProcess(input) {
    input = input.replace(/\\n/g, '\n');
    input = input.replace(/\\t/g, '\t');
    return input;
  }

  function process(input) {
    if (input === undefined) {
      input = '[START_SYMBOL]';
    }

    let toProcess = input.split('');
    let result = '';

    while (toProcess.length > 0) {
      let c = toProcess.shift();

      // handle escaped chars
      if (c === '\\') {
        result += c + toProcess.shift();
        continue;
      } else if (c === '[') {
        result += process(processRule());
      } else if (c === '{') {
        result += process(processVariable());
      } else if (c === '<') {
        result += processCommand();
      } else {
        result += c;
      }
    }
    return result;



    function processRule() {
      let outcomes = [];
      let ruleName = '';
      let input = '';
      let c = null;

      while (toProcess.length > 0) {
        c = toProcess.shift();
        input += c;
        if (ruleName === '' && c.match(/[A-Z]/) !== null ||
          ruleName !== '' && c.match(/[A-Za-z0-9_$%&!?]/) !== null) {
          ruleName += c;
        } else if (c === '|' || c === ']') {
          if (ruleName === '') {
            log(`ERROR: call to nameless Rule`);
            return settings.errorReturnString;
          } else if (!rules.hasOwnProperty(ruleName)) {
            log(`ERROR: call to unknown Rule '${ruleName}'`);
            return settings.errorReturnString;
          } else {
            outcomes = outcomes.concat(rules[ruleName]);
          }
          ruleName = '';
        } else {
          log(`ERROR: illegal character '${c}' in rule call`);
          return settings.errorReturnString;
        }

        if (c === ']') {
          if (outcomes.length > 0) {
            let outcome = outcomes[Math.floor((Math.random() * outcomes.length))];
            return outcome;
          } else {
            log(`ERROR: rule call produces no outcomes: ${'[' + input}`);
            return settings.errorReturnString;
          }
        }
      }
    }

    function processVariable() {
      let varName = '';
      let c = null;

      while (toProcess.length > 0) {
        c = toProcess.shift();
        if ((varName === '' && c.match(/[a-z]/) !== null) ||
            (varName !== '' && c.match(/[A-Za-z0-9_$%&!?]/) !== null)) {
          varName += c;
        } else if (c === '}') {
          if (varName === '') {
            log(`ERROR: call to nameless Variable;`);
            return settings.errorReturnString;
          } else if (!variables.hasOwnProperty(varName)) {
            log(`ERROR: call to unknown Variable '${varName}'`);
            return settings.errorReturnString;
          } else {
            return variables[varName];
          }
        } else {
          log(`ERROR: illegal character '${c}' in variable call`);
          return settings.errorReturnString;
        }
      }
    }

    function processCommand() {
      let args = [''];
      let depth = 0;
      let c = null;

      while (toProcess.length > 0) {
        c = toProcess.shift();
        input += c;
        if (c === '<') {
          ++depth;
        } else if (c === '>') {
          if (--depth < 0) {
            break;
          }
        } else if (depth === 0 && c === '|') {
          args[args.length] = '';
        } else {
          // TODO: check for any illegal character?
          args[args.length - 1] += c;
        }
      }

      let command = args.shift();
      if (command === '') {
        log(`ERROR: call to nameless command`);
      } else if (!commands.hasOwnProperty(command)) {
        log(`ERROR: call to unknown command '${command}'`);
      } else {
        for (let i = 0; i < args.length; ++i) {
          if (args[i].charAt(0) === '~') {
            args[i] = args[i].substr(1, Infinity);
          } else {
            args[i] = process(args[i]);
          }
        }
        return process(commands[command](args));
      }
    }
  }
  
  
  
  this.addCommand = addCommand;
  function addCommand (name, func) {
    commands[name] = func;
  }
  
  
  
  function setSetting (name, value) {
    let validSettings = {
      overrideRules: [true, false],
      keepVariables: [true, false],
      logToConsole: [true, false],
      errorReturnString: []
    }
    
    if (!validSettings.hasOwnProperty(name)) {
      log(`ERROR: there is no setting named '%c${name}%c'`);
    } else if (validSettings[name].length > 0 && !validSettings[name].includes(value)) {
      log(`ERROR: '%c${value}%c' is not a valid value for setting '%c${name}%c'`);
    } else {
      settings[name] = value;
    }
  }
  
  
  
  function log(msg) {
    if (!settings.logToConsole) { return; }
    let n = (msg.match(/%c/g) || []).length;
    let args = [msg];
    for (let i = 0; i < n; ++i) {
      if (i % 2 === 0) {
        args[i + 1] = 'font-style:italic;';
      } else {
        args[i + 1] = 'font-style:normal;';
      }
    }
    console.log.apply(null, args);
  }
}