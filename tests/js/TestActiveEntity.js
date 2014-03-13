var ActiveEntity = require( "../../src/js/ActiveEntity.js" ).ActiveEntity;

var TEST_STATE_A  = "A";
var TEST_STATE_B  = "B";
var TEST_STATE_AA = "A.A";
var TEST_STATE_AB = "A.B";
var TEST_STATE_BA = "B.A";
var TEST_STATE_BB = "B.B";


/******************************************************************************
 *
 * CLASS: TestActiveEntity
 * Inherits from: ActiveEntity
 * Constructor
 *
 ******************************************************************************/
function TestActiveEntity()
{
   console.log( "Starting test active entity" );
   // Call the parent class constructor
   ActiveEntity.call( this, "TestActiveEntity" );

   console.log( "creating top states" );
   // Set up our state machine:
   //    Two top states: A & B
   var stateA = this.AddState( TEST_STATE_A );
   this.AddState( TEST_STATE_B );
   console.log( "creating sub states" );
   //    State A has two substates: A.A and A.B
   this.AddState( TEST_STATE_AA, TEST_STATE_A );
   this.AddState( TEST_STATE_AB, TEST_STATE_A );
   //    State B has two substates: B.A and B.B
   this.AddState( TEST_STATE_BA, TEST_STATE_B );
   this.AddState( TEST_STATE_BB, TEST_STATE_B );

   console.log( "Set Initial state" );
   // Set state A as the initial state
   this.SetInitialState( TEST_STATE_A );
   stateA.SetInitialState( TEST_STATE_AB );

   console.log( "Add Event Handler" );
   // State A Event Hander for Event #1:
   this.AddEventHandler( TEST_STATE_A, 1, this.StateAHandleEvent1 );

   console.log( "Start state machine" );
   // Start the state machine
   this.Start();
}

// Inherit from ActiveEntity
TestActiveEntity.prototype = new ActiveEntity();
// Correct the constructor pointer
TestActiveEntity.prototype.constructor = TestActiveEntity;


/******************************************************************************
 *
 * Event Handler for State A, Event 1
 *
 ******************************************************************************/
TestActiveEntity.prototype.StateAHandleEvent1 = function( eventId, data )
{
   console.log( "Handled event: StateAHandleEvent1" );

   this.Transition( TEST_STATE_BB );
   console.log( "Current State: %s", this.currentState.name );
   
   return true;
};


var tae = new TestActiveEntity();
//console.log( tae );
tae.HandleEvent(1);

process.exit(code=0);
