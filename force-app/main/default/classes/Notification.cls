public with sharing class Notification {

  
  @AuraEnabled public List<String> errors;
   
  public Notification() {
        	errors = new List<String> ();
        }



  public void addError(String message) { errors.add(message); }

  public boolean hasErrors() {
    return ! errors.isEmpty();
  }
}