# StratCraft

# Object Types

There are two primary representations of a strategy in StratCraft:
1) The parsed XML data is downloaded from apex into a Strategy javascript object
2) A separate representation is created to feed the lightning tree control

To keep these separate, the key convention is that anything with "strategy" in it means the core strategy object model, while anything with "tree" in it refers only to the data structures feeding the tree control.

