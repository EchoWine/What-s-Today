<?php

namespace Work\Controller\Admin;

use CoreWine\Http\Request;

class InvoiceController extends AdminController{

	/**
	 * ORM\Model
	 *
	 * @var
	 */
	public $model = 'Work\Model\Invoice';


	/**
	 * Url
	 *
	 * @var
	 */
	public $url = 'admin/work/invoices';

	/**
	 * Url
	 *
	 * @var
	 */
	public $url_alias = 'work:admin.invoices';

	/**
	 * View
	 *
	 * @var
	 */
	public $view = 'Work/admin/item-invoices';
	
	/**
	 * User data
	 *
	 * @var bool
	 */
	public $user_data = true;

	/**
	 * Set views
	 *
	 * @param  $views
	 */
	public function views($views){
		
		$views -> all(function($vi){

			$vi -> id('id');

			$vi -> text('number');

			$vi -> text('year');
			
			$vi -> number('price_gross');

		});

		$views -> form(function($vi){


			$vi -> text('number');
			
			$vi -> text('year');
			
			$vi -> date('date');

			$vi -> toOne('profile_id') 
				-> url('/api/v1/crud/wk_invoice_profiles');
			
			$vi -> toOne('customer_id') 
				-> url('/api/v1/crud/wk_invoice_customers');

			$vi -> text('items');
			
			$vi -> number('price_gross');
			
			$vi -> text('stamp_id');
			
			$vi -> select('template') -> options([
				'INV01' => 'ITA.Regime forfettario'
			]);



		});

		$views -> get(function($vi){

			$vi -> id('id');

			$vi -> text('number');
			
			$vi -> text('year');

			$vi -> toOne('profile_id') 
				-> url('/api/v1/crud/wk_invoice_profiles');
			
			$vi -> toOne('customer_id') 
				-> url('/api/v1/crud/wk_invoice_customers');

			$vi -> text('items');
			
			$vi -> number('price_gross');
			
			$vi -> text('stamp_id');
			
			$vi -> select('template') -> options([
				'INV01' => 'ITA.Regime forfettario'
			]);

			$vi -> dateTime('date');

		});
		
		$views -> search(function($vi){

			$vi -> id('id');

			$vi -> text('number');

			$vi -> text('year');
			$vi -> number('price_gross');

		});
	}


	/**
	 * Index
	 *
	 * @return Response
	 */
	public function index(Request $request){
		if(!\Auth::user() -> permission -> has(\Auth\Model\User::PEX_CHESS))
			return abort(404);
		

		return parent::index($request);
	}
}

?>