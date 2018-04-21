# StratCraft [![Build Status](https://travis-ci.com/alexed1/stratcraft.svg?token=pk3BMsTxRofwFWDGUSeM&branch=master)](https://travis-ci.com/alexed1/stratcraft)

# Introduction
Stratcraft is a graphical design tool that reads and writes recommendationStrategy, an API v42. Salesforce standard metadata type used with the under-development Next Best Action service.

It is built using Aura components and public API's. In fact, the only interaction it has with Salesforce electronically is deploying and retrieving metadata.

The basic usage flow is:
1) the core stratcraft.cmp component is loaded as a Lightning App. It makes a metadata call to retrieve a list of existing recommendationStrategies
2) When the user selects a strategy, the strategy is retrieved as metadata xml. The xml is then converted into an internal Strategy apex class. Then the strategy is converted to JSON and delivered to the client.
3) On the client the JSON is stored as the internal model. There are two display modes: Tree and Diagram. Tree, which isn't used much anymore, converts the strategy representation into a data structured used by the base Lightning Tree Control. This will be rendered on the left side of the screen. In Diagram mode, we use the same JsPlumb library being used by Flow Builder. The strategy representation is converted 
To be continued....
