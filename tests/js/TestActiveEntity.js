
//var State        = require( "../../src/js/State.js" );
var ActiveEntity = require( "../../src/js/ActiveEntity.js" );
var log = require("../../src/js/Logger.js");

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
   this.myName = "Alan";
   
   log.info( "Starting test active entity" );
   // Call the parent class constructor
   ActiveEntity.call( this, "TestActiveEntity" );

   log.info( "creating top states" );
   // Set up our state machine:
   //    Two top states: A & B
   this.AddState( TEST_STATE_A );
   this.AddState( TEST_STATE_B );
   log.info( "creating sub states" );
   //    State A has two substates: A.A and A.B
   this.AddState( TEST_STATE_AA, TEST_STATE_A );
   this.AddState( TEST_STATE_AB, TEST_STATE_A );
   //    State B has two substates: B.A and B.B
   this.AddState( TEST_STATE_BA, TEST_STATE_B );
   this.AddState( TEST_STATE_BB, TEST_STATE_B );

   log.info( "Set Initial state" );
   // Set state A as the initial state
   this.SetInitialState( TEST_STATE_A );
   this.SetInitialState( TEST_STATE_AB, TEST_STATE_A );

   log.info( "Add Event Handler" );
   // State A Event Hander for Event #1:
   this.AddEventHandler( TEST_STATE_AB, 1, this.StateABHandleEvent1 );
   this.AddEventHandler( TEST_STATE_A, 1, this.StateAHandleEvent1 );

   log.info( "Start state machine" );
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
TestActiveEntity.prototype.StateABHandleEvent1 = function( eventId, data )
{
   log.info( "Event 1 Handled by A.B" );
   
   log.info( "******************** %s ********************", this.myName );
   log.info( this );
   log.info( "****************************************" );

   this.Transition( TEST_STATE_BB );

   return true;
};


TestActiveEntity.prototype.StateAHandleEvent1 = function( eventId, data )
{
   log.info( "Event 1 Handled by A" );

   this.Transition( TEST_STATE_A );
   
   return true;
};


var tae = new TestActiveEntity();
tae.HandleEvent( 1 );
//tae.HandleEvent( 1 );

//tae.Transition( TEST_STATE_BB );
//tae.Transition( TEST_STATE_AA );

process.exit(code=0);
