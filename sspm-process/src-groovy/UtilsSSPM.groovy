import org.bonitasoft.engine.api.APIAccessor
import org.bonitasoft.engine.identity.User;
import org.bonitasoft.engine.identity.UserCreator;
import org.bonitasoft.engine.identity.UserSearchDescriptor
import org.bonitasoft.engine.profile.Profile
import org.bonitasoft.engine.profile.ProfileSearchDescriptor
import org.bonitasoft.engine.identity.Group
import org.bonitasoft.engine.identity.GroupSearchDescriptor
import org.bonitasoft.engine.identity.Role
import org.bonitasoft.engine.identity.RoleSearchDescriptor
import org.bonitasoft.engine.search.SearchOptionsBuilder
import org.bonitasoft.engine.search.impl.SearchResultImpl

/**
 * 
 */

/**
 * @author Edgar Andrés Soto
 *
 */
public final class UtilsSSPM {
	
	private UtilsSSPM() { }
	
	/**
	 *@param apiAccessor, the current APIAccessor
	 *@param groupName, name of the group from which to obtain the id
	 *@return Long id, the Group identified by its id (-1 if not match any results)
	 *
	 */
	public static Long getGroupId(APIAccessor apiAccessor, String groupName) {	
				
		Long id = -1L;
			
		SearchOptionsBuilder builder = new SearchOptionsBuilder(0, 100);
		builder.filter(GroupSearchDescriptor.NAME, groupName);
		SearchResultImpl<Group> groupResults = apiAccessor.identityAPI.searchGroups(builder.done());
			
		for (group in groupResults.getResult()){
			return group.id;
		}
			
		return id;
	}
	
	/**
	 *@param apiAccessor, the current APIAccessor
	 *@param profileName, name of the profile from which to obtain the id
	 *@return Long id, the Profile identified by its id (-1 if not match any results)
	 *
	 */
	public static Long getProfileId(APIAccessor apiAccessor, String profileName) {
				
		Long id = -1L;
			
		SearchOptionsBuilder builder = new SearchOptionsBuilder(0, 100);
		builder.filter(ProfileSearchDescriptor.NAME, profileName);
		SearchResultImpl<Profile> profileResults = apiAccessor.profileAPI.searchProfiles(builder.done())
			
		for (profile in profileResults.getResult()){
			return profile.id;
		}
			
		return id;
	}
	
	/**
	 *@param apiAccessor, the current APIAccessor
	 *@param roleName, name of the role from which to obtain the id
	 *@return Long id, the Role identified by its id (-1 if not match any results)
	 *
	 */
	public static Long getRoleId(APIAccessor apiAccessor, String roleName) {
				
		Long id = -1L;
			
		SearchOptionsBuilder builder = new SearchOptionsBuilder(0, 100);
		builder.filter(RoleSearchDescriptor.NAME, roleName);
		SearchResultImpl<Role> roleResults = apiAccessor.identityAPI.searchRoles(builder.done())
			
		for (role in roleResults.getResult()){
			return role.id;
		}
			
		return id;
	}
	
	/**
	 *@param apiAccessor, the current APIAccessor
	 *@param username, username of the user to search
	 *@return Boolean, true if user exists otherwise false
	 *
	 */
	public static Boolean userExists(APIAccessor apiAccessor, String username) {
		
		
		SearchOptionsBuilder builder = new SearchOptionsBuilder(0, 100);
		builder.filter(UserSearchDescriptor.USER_NAME, username);
		SearchResultImpl<User> userResults = apiAccessor.identityAPI.searchUsers(builder.done())
			
		for (user in userResults.getResult()){
			if (user.getUserName() == username) {
				return true;
			}
		}
			
		return false;
	}
	
	/**
	 *@param apiAccessor, the current APIAccessor
	 *@param username, username of the user to search
	 *@return User, the user if exists or null if doesn't exists
	 *
	 */
	public static User findUserByUsername(APIAccessor apiAccessor, String username) {
		
		SearchOptionsBuilder builder = new SearchOptionsBuilder(0, 100);
		builder.filter(UserSearchDescriptor.USER_NAME, username);
		SearchResultImpl<User> userResults = apiAccessor.identityAPI.searchUsers(builder.done())
			
		for (user in userResults.getResult()){
			if (user.getUserName() == username) {
				return user;
			}
		}
			
		return null;
	}
	
	/**
	 *@param apiAccessor, the current APIAccessor
	 *@param userId, id of the user to assign the new membership
	 *@param groupId, id of the group to assign to the user
	 *@param roleId, id of the role to assign to the user
	 *@return Boolean, true if operation succeded or false if operation find an error
	 *
	 */
	public static Boolean addMembership(APIAccessor apiAccessor, Long userId, Long groupId, Long roleId) {
		
		try {
			apiAccessor.identityAPI.addUserMembership(userId, groupId, roleId);
			return true;
			
		}catch (Exception ex){
			return false;
		}
	}
	
	/**
	 *@param apiAccessor, the current APIAccessor
	 *@param userId, id of the user to remove the membership
	 *@param groupId, id of the group to remove the user
	 *@param roleId, id of the role to remove the user
	 *@return Boolean, true if operation succeded or false if operation find an error
	 *
	 */
	public static Boolean removeMembership(APIAccessor apiAccessor, Long userId, Long groupId, Long roleId) {
		
		try {
			apiAccessor.identityAPI.deleteUserMembership(userId, groupId, roleId);
			return true;
			
		}catch (Exception ex){
			return false;
		}
	}
	
	/**
	 *@param apiAccessor, the current APIAccessor
	 *@param username, username for the new account
	 *@param password, password for the new account
	 *@param name, name for the contact data
	 *@param userProfileId, id of the profile to assign to the account
	 *@param groupId, id of the group to assign to the account
	 *@param roleId, id of the role to assign to the account
	 *@return User, new user created or old user with existing username
	 *
	 */
	public static User createAccount(APIAccessor apiAccessor, String username, String password, String name, Long userProfileId, Long groupId, Long roleId) {
		
		UserCreator creator = new UserCreator(username, password);
		creator.setFirstName(name);

		try {
			
			User newUser = apiAccessor.identityAPI.createUser(creator);
			apiAccessor.profileAPI.createProfileMember(userProfileId, newUser.getId(), 0, 0);
			apiAccessor.identityAPI.addUserMembership(newUser.getId(), groupId, roleId);
			return newUser;
			
		}catch (Exception ex){
			
			User oldUser = apiAccessor.identityAPI.getUserByUserName(username);
			return oldUser;
			
		}
	}
	
	/**
	 *@param length, the length of the password to return
	 *@return String, random password
	 *
	 */
	public static String randomString(int length) {
		
		String chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
		Random rand = new Random();
		StringBuilder buf = new StringBuilder();
		for (int i=0; i<length; i++) {
			buf.append(chars.charAt(rand.nextInt(chars.length())));
		}
		return buf.toString();
	}
}
