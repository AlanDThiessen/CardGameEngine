function Table()
{
   CardContainer.call( this, "table" );
}

// Inherit from CardContainer
Table.prototype = new CardContainer();

// Correct the constructor pointer
Table.prototype.constructor = Table;


Table.prototype.init = function()
{
}


