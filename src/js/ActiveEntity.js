
module.exports = 
{
      State: State,
      ActiveEntity: ActiveEntity
};


var TOP_STATE  = "TOP";


/******************************************************************************
 *
 * Class: State
 * Constructor
 *
 ******************************************************************************/
function State( name, parent )
{
   this.name         = name;
   this.parent       = parent;
   this.initial      = undefined;
   this.enter        = undefined;
   this.exit         = undefined;
   this.states       = Array();
   this.handlers     = {};

   // Logging/Debug
   var ancestorList = Array();
   this.GetAncestors(ancestorList);
   console.log( "Created New State: %s", ancestorList.join(':') );
}


/******************************************************************************
 *
 * State.prototype.AddState
 *
 ******************************************************************************/
State.prototype.AddState = function( state )
{
   this.states.push( state );
};


/******************************************************************************
 *
 * State.prototype.AddEventHandler
 *
 ******************************************************************************/
State.prototype.AddEventHandler = function( eventId, routine )
{
   // TODO: Need to verify routine is a real function
   this.handlers[eventId] = routine;
};


/******************************************************************************
 *
 * State.prototype.SetInitialState
 *
 ******************************************************************************/
State.prototype.SetInitialState = function( stateName )
{
   var state = this.FindState( stateName );

   if( state != undefined )
   {
      console.log( "State %s: Initial State set to %s", this.name, state.name );
      this.initial = state;
   }
};


/******************************************************************************
 *
 * State.prototype.SetEnterRoutine
 *
 ******************************************************************************/
State.prototype.SetEnterRoutine = function( routine )
{
   // TODO: Need to verify this is a valid routine
   this.enter = routine;
};


/******************************************************************************
 *
 * State.prototype.SetExitRoutine
 *
 ******************************************************************************/
State.prototype.SetExitRoutine = function( routine )
{
   // TODO: Need to verify this is a valid routine
   this.exit = routine;
};


/******************************************************************************
 *
 * State.prototype.EnterState
 * 
 * This method performs recursive entrance to this state, starting with the
 * common ancestor (the common ancestor is not entered).
 *
 ******************************************************************************/
State.prototype.EnterState = function( commonAncestor )
{
   // If we are the common ancestor, then our state doesn't get entered
   if( commonAncestor != this.name )
   {
      // First, enter our parent state
      if( this.parent != undefined )
      {
         this.parent.EnterState( commonAncestor );
      }

      console.log( "Enter State: %s", this.name );

      if( this.enter != undefined )
      {
         this.enter();
      }
   }
};


/******************************************************************************
 *
 * State.prototype.ExitState
 * 
 * This method performs recursive exit from this state, all the way up to the
 * common ancestor (the common ancestor is not exited).
 *
 ******************************************************************************/
State.prototype.ExitState = function( commonAncestor )
{
   // If we are the common ancestor, then our state doesn't get exited.
   if( commonAncestor != this.name )
   {
      console.log( "Exit State: %s", this.name );

      if( this.exit != undefined )
      {
         this.exit();
      }

      // Now, attempt to exit our parent state
      if( this.parent != undefined )
      {
         this.parent.ExitState( commonAncestor );
      }
   }
};


/******************************************************************************
 *
 * State.prototype.HandleEvent
 *
 ******************************************************************************/
State.prototype.HandleEvent = function( eventId, data )
{
   var   eventHandled = false;
   
   
   if( this.handlers.hasOwnProperty( eventId ) )
   {
      eventHandled = this.handlers[eventId]( data );
   }

   // We didn't handle the event, so pass it to our parent state
   if( ( eventHandled == false ) && ( this.parent != undefined ) )
   {
      this.parent.HandleEvent( eventId, data );
   }
};


/******************************************************************************
 *
 * State.prototype.GetAncestors
 * 
 * This method builds a top -> down list of ancestors to this state
 *
 ******************************************************************************/
State.prototype.GetAncestors = function( ancestorList )
{
   // TODO: Verify ancestorList is an array

   // First, get our parent state
   if( this.parent != undefined )
   {
      this.parent.GetAncestors( ancestorList );
   }

   // Finally, put our name on the list
   ancestorList.push( this.name );
};


/******************************************************************************
 *
 * State.prototype.FindState
 *
 ******************************************************************************/
State.prototype.FindState = function( name, goDeep )
{
   var stateFound = undefined;


   console.log( "State %s: Find state %s", this.name, name );
   if( goDeep == undefined )
   {
      goDeep = false;
   }

   if( name == this.name )
   {
      console.log( "State %s: This state found", this.name );
      stateFound = this;
   }
   else
   {
      for( var cntr = 0; cntr < this.states.length; cntr++ )
      {
         if( this.states[cntr].name == name )
         {
            console.log( "   State %s: State found at index %d", this.name, cntr );
            stateFound = this.states[cntr];
            break;
         }
      }
      
      if( goDeep && ( stateFound == undefined ) )
      {
         cntr = 0;
         
         while( !stateFound && ( cntr < this.states.length ) )
         {
            stateFound = this.states[cntr].FindState( name, true );
            cntr++;
         }
      }
   }

   return( stateFound );
};


/******************************************************************************
 *  CLASS: ActiveEntity
 ******************************************************************************/

/******************************************************************************
 *
 * Class: ActiveEntity
 * Constructor
 *
 ******************************************************************************/
function ActiveEntity( name )
{
   this.name         = name;
   this.initial      = undefined;
   this.currentState = undefined;
   this.topState     = new State( TOP_STATE );
}


/******************************************************************************
 *
 * ActiveEntity.prototype.AddState
 * 
 * This method creates a state, and adds it to the parent state.  If the parent
 * state is not defined, then the state is added to the topState.
 *
 ******************************************************************************/
ActiveEntity.prototype.AddState = function( name, parentName )
{
   var   parent = undefined;


   if( parentName != undefined )
   {
      parent = this.topState.FindState( parentName, true );
   }

   // If we didn't find the state name, or it's undefined, then set the topState
   // as the parent of the new state.
   if( parent == undefined )
   {
      parent = this.topState;
   }

   // For now, assume they are valid
   var state = new State( name, parent );
   parent.AddState( state );

   return( state );
};


ActiveEntity.prototype.AddEventHandler = function( stateName, eventId, routine )
{
   var   state = this.topState.FindState( stateName, true );
   
   if( state != undefined )
   {
      state.AddEventHandler( eventId, routine );
   }
};


/******************************************************************************
 *
 * ActiveEntity.prototype.SetInitialState
 * 
 * This method sets the initial state of the Active Entity (i.e. the initial
 * substate of the topState)
 *
 ******************************************************************************/
ActiveEntity.prototype.SetInitialState = function( stateName )
{
   this.topState.SetInitialState( stateName );
};


/******************************************************************************
 *
 * ActiveEntity.prototype.Start
 * 
 * This method starts the state machine.  i.e. It performs the initial
 * transition to the topState.  Note: If the topState does not have an initial
 * substate defined, then the state machine is never really started.
 *
 ******************************************************************************/
ActiveEntity.prototype.Start = function()
{
   console.log( "Start: transition to %s", TOP_STATE );
   this.currentState = this.topState;
   this.Transition( TOP_STATE );
};


/******************************************************************************
 *
 * ActiveEntity.prototype.HandleEvent
 *
 ******************************************************************************/
ActiveEntity.prototype.HandleEvent = function( eventId, data )
{
   if( this.currentState != undefined )
   {
      this.currentState.HandleEvent( eventId, data );
   }
};


/******************************************************************************
 *
 * ActiveEntity.prototype.Transition
 * 
 * This method performs a recursive transition from the current state to the
 * specified destination state.  
 *
 ******************************************************************************/
ActiveEntity.prototype.Transition = function( destStateName )
{
   var destAncestors = Array();
   var srcAncestors  = Array();
   var found         = undefined;
   var lcAncestor    = TOP_STATE;   // The Lowest Common Ancestor
   var destState     = this.topState.FindState( destStateName, true );


   console.log( "Transition: %s -> %s; ", this.currentState.name, destStateName );

   if( destState != undefined )
   {
      // TODO: If we are coming from outside the destination state, then we will
      //       need to change the destination state to the initial substate.
      //       For now, assume it's external.
      while( destState.initial != undefined )
      {
         destState = destState.initial;
      }

      // First, get the ancestors of the source and destination states. 
      destState.GetAncestors( destAncestors );
      this.currentState.GetAncestors( srcAncestors );
      
      console.log( destAncestors );
      console.log( srcAncestors );

      // Now, iterate from the bottom of the source ancestor list to find the 
      // Lowest common denominator of both states.
      // The first one popped off the list should be current state.
      while( ( found == undefined ) && srcAncestors.length )
      {
         lcAncestor = srcAncestors.pop();
         found = destAncestors.indexOf( lcAncestor );
      }

      console.log( "Common Ancestor: %s", lcAncestor );

      // Did we find a common ancestor?
      if( found != undefined  )
      {
         // Exit the current state, all the way up to the common ancestor
         this.currentState.ExitState( lcAncestor );

         // TODO: If/when we add transition actions, we need to perform it
         //       between states

         // Now, Enter the destination state, all the way from the common ancestor
         destState.EnterState( lcAncestor );

         // Finally, update our current state variable
         this.currentState = destState;
      }
      else
      {
         // We should never get here because every state should have topState
         console.error( "Could not find common ancestor state" );
      }
   }
   else
   {
      console.log( "Transition to undefined state in ActiveEntity: %s", this.name );
   }
};
