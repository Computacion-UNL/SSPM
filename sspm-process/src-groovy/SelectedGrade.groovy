import com.company.model.Student

/**
 * 
 */

/**
 * @author Edgar Andrés Soto
 *
 */
class SelectedGrade {
	
	Integer number
	String parallel
	Integer amount
	List<SelectedStudent> students = new ArrayList<SelectedStudent>()
	
	public List<SelectedStudent> getStudents() {
		return students;
	}
	
	public void addToStudents(SelectedStudent addTo) {
		this.students.add(addTo);
	}
	
	@Override
	public String toString() {
		// TODO Auto-generated method stub
		return this.number.toString() + '-' + this.parallel + '-' + this.amount.toString();
	}
}
