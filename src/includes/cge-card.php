<?php

class Card {

	private $id;
	private $name;
	private $suit;
	private $value;

	function __construct( $id, $name = null, $suit = null, $value = null ) {
		$this->id = (string) $id;
		$this->name = (string) $name;
		if (is_a( $suit, 'CardSuit' )) {
			$this->suit = $suit;
		}
		if (is_a( $value, 'CardValue' )) {
			$this->value = $value;
		}
	}

	public function get_id() {
		return $this->id;
	}

	public function set_id( $id ) {
		$this->id = (string) $id;
		return true;
	}

	public function get_name() {
		return $this->name;
	}

	public function set_name( $name ) {
		$this->name = (string) $name;
		return true;
	}

	public function get_suit() {
		return $this->suit;
	}

	public function set_suit( $suit ) {
		if (is_a( $suit, 'CardSuit' )) {
			$this->suit = $suit;
			return true;
		}
		return false;
	}

	public function get_value() {
		return $this->value;
	}

	public function set_value( $value ) {
		if (is_a( $value, 'CardValue' )) {
			$this->value =  $value;
			return true;
		}
		return false;
	}

}

class CardSuit {

	private $id;
	private $name;
	private $shortname;
	private $color;
	private $symbol;

	function __construct( $id, $name = null, $shortname = null, $color = null, $symbol = null ) {
		$this->id = (string) $id;
		$this->name = (string) $name;
		$this->shortname = (string) $shortname;
		$this->color = (string) $color;
		$this->symbol = (string) $symbol;
	}

	public function get_id() {
		return $this->id;
	}

	public function set_id( $id ) {
		$this->id = (string) $id;
		return true;
	}

	public function get_name() {
		return $this->name;
	}

	public function set_name( $name ) {
		$this->name = (string) $name;
		return true;
	}

	public function get_shortname() {
		return $this->shortname;
	}

	public function set_shortname( $shortname ) {
		$this->shortname = (string) $shortname;
		return true;
	}

	public function get_color() {
		return $this->color;
	}

	public function set_color( $color ) {
		$this->color = (string) $color;
		return true;
	}

	public function get_symbol() {
		return $this->symbol;
	}

	public function set_symbol( $symbol ) {
		$this->symbol = (string) $symbol;
		return true;
	}
}

class CardValue {

	private $id;
	private $name;
	private $shortname;
	private $rank;

	__construct($id, $name = null, $shortname = null, $rank = null) {
		$this->id = (string) $id;
		$this->name = (string) $name;
		$this->shortname = (string) $shortname;
		$this->rank = (integer) $rank;
	}

	public function get_id() {
		return $this->id;
	}

	public function set_id( $id ) {
		$this->id = (string) $id;
		return true;
	}

	public function get_name() {
		return $this->name;
	}

	public function set_name( $name ) {
		$this->name = (string) $name;
		return true;
	}

	public function get_shortname() {
		return $this->shortname;
	}

	public function set_shortname($shortname) {
		$this->shortname =  (string) $shortname;
		return true;
	}

	public function get_rank() {
		return $this->rank;
	}

	public function set_rank($rank) {
		$this->rank = (integer) $rank;
		return true;
	}

}
