<?php

namespace Api\Response;

use CoreWine\Http\Request;

class ApiAddSuccess extends Success{

	/** 
	 * Code
	 */
	const CODE = 'success';

	/**
	 * Message
	 */
	const MESSAGE = "Resource was added with success";

	/**
	 * Construct
	 *
	 * @param ORM\Model $model
	 * @param array $new
	 */
	public function __construct($model){

		parent::__construct(static::CODE,static::MESSAGE);
		$this -> setData(['id' => $model -> id,'resource' => $model -> toArray()]) -> setRequest(Request::getCall());

	}
}

?>