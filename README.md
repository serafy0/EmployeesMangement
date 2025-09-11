# How to run

## clone this repo
```bash
git clone https://github.com/serafy0/EemployeesMangement.git
cd EemployeesMangement
```

## Backend setup
```
cd EmployeeManagementBackend/EmployeeManagementBackend
```
 setup your local database in [ConnectionStrings](https://github.com/serafy0/EemployeesMangement/blob/ff0e451179d5cf950e39ade646979b6ea9d715e6/EmployeeManagementBackend/EmployeeManagementBackend/appsettings.json#L10C18-L10C19) and preferred admin phone number and password in appsetting.json

### run database migrations
```bash
dotnet ef database update
```
### start backend
```
dotnet run --launch-profile https
```
backend docs should be running on `https://localhost:7059/swagger`

## frontend setup

```bash
cd EmployeeManagementFrontend
npm install
ng serve
```
it should be running on `http://localhost:4200`


# Video Demo



https://github.com/user-attachments/assets/685209ce-6199-4947-b7f7-4230ad2294da


# Screenshots

## Admin ponit of view

  <img width="1895" height="920" alt="Admin view 1" src="https://github.com/user-attachments/assets/729bcbdf-b6f4-47f6-a9e9-31ebf42f098f" />
  
  
  
  <img width="1898" height="739" alt="Admin view 2" src="https://github.com/user-attachments/assets/5d63a386-237c-45e9-8775-0daef491201b" />
  <img width="763" height="912" alt="admin view 3" src="https://github.com/user-attachments/assets/e99b8558-8e0b-440d-8076-fbe8964d0f0a" />
  <img width="1911" height="717" alt="Admin view 4" src="https://github.com/user-attachments/assets/5656c1cc-7be6-4501-ba8c-4bfe4540c9eb" />
  <img width="1883" height="895" alt="Admin View 5" src="https://github.com/user-attachments/assets/35325eda-9601-43fc-9efe-ae2042024846" />
  <img width="1764" height="651" alt="Admin view 6" src="https://github.com/user-attachments/assets/f97fa8a1-71fa-4804-bade-b7f980c2df75" />



## Employee Point of View


  <img width="1898" height="785" alt="Employee View 3" src="https://github.com/user-attachments/assets/4444023c-22c8-4cfc-9071-ffdbc8642dda" />
  <img width="1874" height="523" alt="Employee View 1" src="https://github.com/user-attachments/assets/e90a222d-8821-4c06-bbad-3591994b8b4f" />
  <img width="1874" height="749" alt="Employee View 2" src="https://github.com/user-attachments/assets/13213bf5-d53a-4eb0-8f12-5d9510c1037b" />
  
<img width="1845" height="733" alt="Employee View 4" src="https://github.com/user-attachments/assets/b78cdebb-7f01-4c34-be34-f1deb106dc15" />

## Database Schema


<img width="842" height="665" alt="Screenshot 2025-09-11 083245" src="https://github.com/user-attachments/assets/080f6114-e192-434c-9aa6-c3dc6401a48e" />



