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
Usually every outcome is picked with the same possibility. It is however possible to adjust that possibility with weights. A weight is set per outcome and has to be a positive integer. It is written with a `#` directly before the outcome: `#5>my outcome`. In this example *my outcome* is five times as likely to occure than other outcomes of that rule.

**Note**: This parser is not very sophisticated, an outcome weight simply means the outcome is added to the list of possible outcomes several times. This means that high numbers in weights will take a lot of memory and may slow down the processing.

### Combined Production Rules
It is possible to produce call a comined production rule from defined production rules. The so created production rule containes all outcomes of all called rules. It also preserves the weighting. The rule names are separated by a `|` like this `[RULE1|RULE2]`.

## Commands
Forlog offers a list of commands that extend the simple replace mechanic. A command is called with pointy brackets `<` and `>`.
