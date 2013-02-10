<?php

class Group {

	private $id;
	private $name;
	private $group;

	__construct( $id, $name = null, $group = null ) {
		$this->id = $id;
		$this->name = (string) $name;
		if ( is_array($group) ) {
			$this->group = $group;
		}
	}

	public function get_id() {
		return $this->id;
	}

	public function set_id($id) {
		$this->id =  (string) $id;
		return true;
	}

	public function get_name() {
		return $this->name;
	}

	public function set_name($name) {
		$this->name =  (string) $name;
		return true;
	}

	public function get_group() {
		return $this->group;
	}

	public function set_group( $group ) {
		if ( is_array( $group ) ) {
			$this->group =  $group;
			return true;
		}
		return false;
	}

	public function add_group( $group ) {
		if ( is_array( $group ) ) {
			if ( is_array( $this->group ) ) {
				$this->group = array_merge( $this->group, $group );
			} else {
				$this->group = $group;
			}
			return true;
		}
		return false;
	}

}

