
var TEST_STATE_A  "A";
var TEST_STATE_B  "B";
var TEST_STATE_AA "A.A";
var TEST_STATE_AB "A.B";


/******************************************************************************
 *
 * CLASS: TestActiveEntity
 * Inherits from: ActiveEntity
 * Constructor
 *
 ******************************************************************************/
function TestActiveEntity( )
{
   // Call the parent class constructor
   ActiveEntity.call( this, "TestActiveEntity" );

   // Set up our state machine:
   //    Two top states: A & B
   this.AddState( TEST_STATE_A );
   this.AddState( TEST_STATE_B );
   //    State A has two substates: A.A and A.B
   this.AddState( TEST_STATE_AA, TEST_STATE_A );
   this.AddState( TEST_STATE_AB, TEST_STATE_A );
   
   // Set state A as the initial state
   this.SetInitialState( TEST_STATE_A );
   
   // State A Event Hander for Event #1:
   this.AddEventHandler( TEST_STATE_A, 1, this.StateAHandleEvent1 );
   
   // Start the state machine
   this.Start();
}

// Inherit from CardContainer
TestActiveEntity.prototype = new ActiveEntity();
// Correct the constructor pointer
TestActiveEntity.prototype.constructor = TestActiveEntity;


TestActiveEntity.prototype.StateAHandleEvent1 = function( data )
{
   // Do something with this data
};

