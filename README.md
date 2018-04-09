# Forlog
Forlog is a script language to define formal grammars and this is a processor for such grammars. The idea behind Forlog is to provide a simple to use grammar processor for text generation.

## Introduction to Forlog
Forlog has a context-free grammar as a basis extended by conditional and memory functionality (which takes away the *context-free* part). The backbone of every Forlog grammar are production rules. The default start symbol is `START_SYMBOL`.

Forlog grammars are stored in `*.flg` files (**F**or**l**og **g**rammar).

## Production Rules
A production rule is a simple replacement rule of the form *A → x*, meaning *A* (the name of the rule) is replaced by *x* (the outcome). The Forlog notation for the same is 
```
A
>x
```
**Note**: Since Forlog files are parsed line by line, linebreaks are important. If you want a linebreak inside an outcome, you have to use `\n`.

One rule can have more than one outcome. The rule `FOOD` will randomly produce one of the three defined outcomes:
```
FOOD
>pizza
>steak
>noodles
```

A rule can be called with square brackets `[` and `]`.
```
START_SYMBOL
>Today I crave for [FOOD].
```
### Outcome Weights
Usually every outcome is picked with the same possibility. It is however possible to adjust that possibility with weights. A weight is set per outcome and has to be a positive integer. It is written with a number sign `#` directly before the outcome: `#5>my outcome`. In this example *my outcome* is five times as likely to occure than other outcomes of that rule.

**Note**: This parser is not very sophisticated, an outcome weight simply means the outcome is added to the list of possible outcomes several times. This means that high numbers in weights will take a lot of memory and may slow down the processing.

### Combined Production Rules
It is possible to produce call a comined production rule from defined production rules. The so created production rule containes all outcomes of all called rules. It also preserves the weighting. The rule names are separated by a vertical bar `|` like this `[RULE1|RULE2]`.

## Commands
Forlog offers a list of commands that extend the simple replace mechanic. A command is called with pointy brackets `<` and `>`. A command can have an outcome (like the `for` command) but doesn't have to (like the `set` command). The arguments given to a command are separated with a vertical bar `|`. The first argument is always the name of the command.  E.g. the command `<set|myvar|green>` sets the variable `myvar` to the value `green` and produces no outcome. The command `<for|3|bla>` produces the outcome `blablabla`.

This is a list of all available commands in version 2.0:

Command | Effect | Parameters
--- | --- | ---
`<for\|n\|do>` | repeats `do` for `n` times | `n` needs to be a non-negative integer
`<rnd\|min\|max>` | produces a random integer between (incl.) `min` and (excl.) `max`. | `min` and `max` need to be integers
`<set\|varname\|value>` | sets the variable `varname` to value `value` | `varname` needs to be a valid variable name
`<set?\|varname\|value>` | sets the variable `varname` to value `value` only if the variable with name `varname` is not set yet | `varname` needs to be a valid variable name
`<eq\|val1\|val2\|do>` or `<eq\|val1\|val2\|do\|else>` | if `val1` and `val2` are equal (string compare) it produces `do`; otherwise it produces `else`, if an `else` parameter is given | 
`<lt\|val1\|val2\|do>` or `<lt\|val1\|val2\|do\|else>` | if `val1` is less than `val2` it produces `do`; otherwise it produces `else`, if an `else` parameter is given | `val1` and `val2` need to be integers
`<gt\|val1\|val2\|do>` or `<gt\|val1\|val2\|do\|else>` | if `val1` is greater than `val2` it produces `do`; otherwise it produces `else`, if an `else` parameter is given | `val1` and `val2` need to be integers
`<leq\|val1\|val2\|do>` or `<leq\|val1\|val2\|do\|else>` | if `val1` is less than or equal to `val2` it produces `do`; otherwise it produces `else`, if an `else` parameter is given | `val1` and `val2` need to be integers
`<geq\|val1\|val2\|do>` or `<geq\|val1\|val2\|do\|else>` | if `val1` is greater than or equal `val2` it produces `do`; otherwise it produces `else`, if an `else` parameter is given | `val1` and `val2` need to be integers

Unlike production rules, commands can be nested: `<for|<rnd|5|10>|[FANCY_RULE]>`

### Preprocessing of Arguments
Arguments in commands can be either processed before the command is executed or not. In any case, the complete outcome of the command is processed afterwards. By default every argument is preprocessed. If an argument should not be processed before the execution of the command, a tilde `~` has to be placed before it. This makes a difference especially for the `for` and `set` commands. While `<for|5|<rnd|0|100>\n>` will output the same number five times (because `<rnd|0|100>` is processed before the execution of the `for` command), `<for|5|~<rnd|0|100>\n>` will produce five (most likely) different numbers.


## Variables
Variables in Forlog are set by the `set` and `set?` commands. A variable is called with curly brackets `{` and `}`. A variabel that is not set can not be called and produces an error.
```
START_SYMBOL
><set|color|[COLOR]>My favourite color is {color}, because {color} is beautiful.

COLOR
>red
>green
>blue
```
