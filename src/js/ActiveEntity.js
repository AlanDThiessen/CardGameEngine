
var TOP_STATE  = "TOP";


/******************************************************************************
 *
 * Class: State
 * Constructor
 *
 ******************************************************************************/
function State( name, routine, parent )
{
   this.name         = name;
   this.parent       = parent;
   this.initial      = undefined;
   this.enter        = undefined;
   this.exit         = undefined;
   this.handleEvent  = routine;
   this.states       = Array();
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
 * State.prototype.SetInitialState
 *
 ******************************************************************************/
State.prototype.SetInitialState = function( stateName )
{
   var state = this.FindState( stateName );
   
   if( state != undefined )
   {
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

      console.debug( "Enter State: %s", this.name );

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
      console.debug( "Exit State: %s", this.name );

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


   if( goDeep == undefined )
   {
      goDeep = false;
   }

   for( var cntr = 0; cntr < this.states.length; cntr++ )
   {
      if( this.states[cntr].name == name )
      {
         stateFound = this.states[cntr];
         break;
      }
   }

   if( goDeep && ( stateFound == undefined ) )
   {
      cntr = 0; this.states.length;
      
      while( !stateFound && ( cntr < this.states.length ) )
      {
         stateFound = this.states[cntr].FindState( name, true );
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
function ActiveEntity( name, parent )
{
   this.name         = name;
   this.initial      = undefined;
   this.currentState = undefined;
   this.TopState     = new State( TOP_STATE, this.TopHandleEvent );
}


/******************************************************************************
 *
 * ActiveEntity.prototyp.TopoHandleEvent
 * 
 * This method implements the Event Handler for the very top state.
 *
 ******************************************************************************/
ActiveEntity.prototype.TopHandleEvent = function( event )
{
};


/******************************************************************************
 *
 * ActiveEntity.prototype.AddState
 * 
 * This method creates a state, and adds it to the parent state.  If the parent
 * state is not defined, then the state is added to the TopState.
 *
 ******************************************************************************/
ActiveEntity.prototype.AddState = function( name, routine, parentName )
{
   var   parent = undefined;


   if( parentName != undefined )
   {
      parent = this.TopState.FindState( parentName, true );
   }

   // If we didn't find the state name, or it's undefined, then set the TopState
   // as the parent of the new state.
   if( parent == undefined )
   {
      parent = this.TopState;
   }

   // TODO: Need type check of routine.
   // For now, assume they are valid
   var state = new State( name, routine, parent );
   parent.AddState( state );

   return( state );
};


/******************************************************************************
 *
 * ActiveEntity.prototype.SetInitialState
 * 
 * This method sets the initial state of the Active Entity (i.e. the initial
 * substate of the TopState)
 *
 ******************************************************************************/
ActiveEntity.prototype.SetInitialState = function( state )
{
   this.initial = state;
};


/******************************************************************************
 *
 * ActiveEntity.prototype.Start
 * 
 * This method starts the state machine.  i.e. It performs the initial
 * transition to the TopState.  Note: If the TopState does not have an initial
 * substate defined, then the state machine is never really started.
 *
 ******************************************************************************/
ActiveEntity.prototype.Start = function()
{
   this.Transition( TOP_STATE );
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
   var srcAncestors  = Array;
   var destState     = this.TopState.FindState( destStateName, true );
   var found         = undefined;
   var lcAncestor    = TOP_STATE;   // The Lowest Common Ancestor


   if( destState != undefined )
   {
      // TODO: If we are coming from outside the destination state, then we will
      //       need to change the destination state to the initial substate.
      //       For now, assume it's external.
      if( destState.initial != undefined )
      {
         destState = destState.initial;
      }

      // First, get the ancestors of the source and destination states. 
      destState.GetAncestors( destAncestors );
      this.currentState.GetAncestors( srcAncestors );

      // Now, iterate from the bottom of the source ancestor list to find the 
      // Lowest common denominator of both states.
      // The first one popped off the list should be current state.
      while( ( found == undefined ) && srcAncestors.length )
      {
         lcAncestor = srcAncestors.pop();
         found = destAncestors.indexOf( lcAncestor );
      }

      // Did we find a common ancestor?
      if( found != undefined  )
      {
         // Exit the current state, all the way up to the common ancestor
         this.currentState.ExitState( lcAncestor );

         // TODO: If/when we add transition actions, we need to perform it
         //       between states
         
         // Now, Enter the destination state, all the way from the common ancestor
         this.toState.EnterState( lcAncestor );

         // Finally, update our current state variable
         this.currentState = destState;
      }
      else
      {
         // We should never get here because every state should have TopState
         console.error( "Could not find common ancestor state" );
      }
   }
   else
   {
      console.log( "Transition to undefined state in ActiveEntity: %s", this.name );
   }
};
