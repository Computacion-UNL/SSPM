
/**
 * 
 */

/**
 * @author Edgar Andrés Soto
 *
 */
class SelectedStudent {
	
	Long persistenceId;
    String name;
    String lastName;
    String email;
	Boolean selected;

	@Override
	public String toString() {
		// TODO Auto-generated method stub
		return this.name + '-' + this.lastName + '-' + this.email + '-' + this.email;
	}
	
}
