<?php

namespace Auth\Service;

use CoreWine\DataBase\DB;
use CoreWine\Component\Cfg;
use CoreWine\Http\Request;
use Service;

use Auth\Model\User;
use Auth\Model\Session;

class Auth implements Service{

	/**
	 * Auth\Entity\User
	 */
	public static $user = null;

	/**
	 * Auth\Entity\Session
	 */
	public static $session = null;

	public static function facade(){
		return 'Auth';
	}

	/**
	 * Initilization
	 */
	public static function load(){

		User::schema();
		Session::schema();
		
		Auth::removeSessionExpired();
	}

	/**
	 * Check if current user is logged
	 */
	public static function authenticate($sid){

		if(empty($sid))
			return null;

		$session = Session::where('sid',$sid) -> first();

		if(!empty($session)){

			Auth::$user = $session -> user;
			Auth::$session = $session;	

		}
	
	}

	/**
	 * Get entity User
	 *
	 * @return Auth\Entity\User
	 */
	public static function user(){
		return Auth::$user;
	}

	/**
	 * Get entity Session
	 *
	 * @return Auth\Entity\Session
	 */
	public static function session(){
		return Auth::$session;
	}

	/**
	 * User is logged
	 *
	 * @return bool
	 */
	public static function logged(){
		return Auth::user() !== null;
	}

	/**
	 * Logout current user
	 */
	public static function logout($user){

		return Session::where('user_id',$user -> id) -> delete();

	}

	/**
	 * Login
	 *
	 * @param array $user
	 * @param cfg $type
	 */
	public static function login($user,$expire){

		$sid = Auth::generateSID();

		$expire = time()+$expire;

		return Session::create([
			'user' => $user,
			'sid' => $sid,
			'expire' => $expire
		]);


	}
	
	/**
	 * Get hash password
	 *
	 * @param string $v password
	 * @return string hash password
	 */
	public static function getHashPass($v){
		
		return hash('sha512',sha1($v).$v); 
	}

	/**
	 * Get current display name (user or email)
	 *
	 * @return string display name
	 */
	public static function getUserDisplay(){
		if(!Auth::logged())return '[User not logged]';
		return Cfg::get('Auth.display') == 0 ? Auth::user() -> username : Auth::user() -> email;
	}

	/**
	 * Delete session expired
	 */
	public static function removeSessionExpired(){
		return Session::where('expire','<',time()) -> delete();
	}

	/**
	 * Delete session of user using sid
	 *
	 * @param string $sid
	 */
	public static function deleteSessionBySID($sid){
		return Session::where('sid',$sid) -> delete();
	}

	/**
	 * Get new SID that isn't already used
	 *
	 * @return string sid
	 */
	public static function generateSID(){

		do{
			$sid = md5(microtime());
			$q = Session::where('sid',$sid) -> count();
		}while($q == 1);

		return $sid;
	}

	/**
	 * Get a user using a username/email 
	 * 
	 * @param string $usernameOrEmail
	 * @param string $password
	 * @return result
	 */
	public static function getUsersByRaw($usernameOrEmail,$password){
		
		# Building query
		$q = User::where('password',$password);
		
		if(Cfg::get('Auth.login_user'))
			$q = $q -> orWhere('username','= BINARY',$usernameOrEmail);

		if(Cfg::get('Auth.login_mail'))
			$q = $q -> orWhere('email','= BINARY',$usernameOrEmail);

		# Execute query
		$q = $q -> get();

		return $q;

	}

	/**
	 * Retrieve user given a token
	 *
	 * @param string $token
	 *
	 * @return User
	 */
	public static function getUserByToken($token){

		if(!$token)
			return null;
		
		return User::where('token',$token) -> first();
	}

}

?>