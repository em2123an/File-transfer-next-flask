import time
from flask import Flask, flash, render_template, request, send_file, redirect, url_for,send_from_directory, request, Request, Response
from flask.json import jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
import os
import socket
import pyqrcode
import webbrowser
from flask_cors import CORS

def chk_subdir (parent_path, child_path):
    parent_path = os.path.abspath(parent_path)
    child_path = os.path.abspath(child_path)
    try:
        return os.path.commonpath([parent_path]) == os.path.commonpath([parent_path, child_path])
    except Exception as e:
        return False

def get_mydocuments():
    import ctypes.wintypes
    CSIDL_PERSONAL = 5       # My Documents
    SHGFP_TYPE_CURRENT = 0   # Get current, not default value
    buf= ctypes.create_unicode_buffer(ctypes.wintypes.MAX_PATH)
    ctypes.windll.shell32.SHGetFolderPathW(None, CSIDL_PERSONAL, None, SHGFP_TYPE_CURRENT, buf)
    return buf.value #gives the current my documents folder path

app = Flask(__name__)
CORS(app)
#Destination_Folder = os.path.join(os.getcwd, 'FT_Trial2')
#new_path = 'C:\\Users\\i3\\Documents\\Rojo_Shared_Folder'
#os.environ['LOCAL_DATA_SHARE'] = new_path
#Destination_Folder = os.path.join(os.getenv('USERPROFILE'), 'FT_Trial2')
try:
    Destination_Folder = os.path.join(get_mydocuments(), 'Rojo_Shared_Folder')
except Exception as e:
    Destination_Folder = os.path.join(os.getenv('USERPROFILE'), 'Rojo_Shared_Folder')
if not os.path.isdir(Destination_Folder):
    os.mkdir(Destination_Folder)
app.config['UPLOAD_FOLDER'] = Destination_Folder
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'       
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False    
db = SQLAlchemy(app)
    

class Upload (db.Model):
    id = db.Column(db.Integer, primary_key=True)
    file_name = db.Column(db.String, nullable=False)
    file_size = db.Column(db.Float)

@app.route('/', methods=['GET','POST'])
def uploading():
    if request.method == 'POST':
        file = request.files['file']
        if file.filename == '':
            return redirect(request.url)
        filename = secure_filename(file.filename)
        file.save(os.path.join(Destination_Folder,filename))
        file_size = round(os.stat(os.path.join(Destination_Folder,filename)).st_size/1048.576,2)
        db.session.add(Upload(file_name=filename, file_size=file_size))
        db.session.commit()
        return redirect(url_for('history'))
    return render_template('index.html')

@app.route('/history')
def history():
    return render_template('list.html', my_files = Upload.query.all())

@app.route('/download')
def download():
    return redirect(url_for('give_files', relpath=Destination_Folder))

@app.route('/downloadfiles/<relpath>')
def give_files(relpath):
    print(relpath)
    if relpath == Destination_Folder:
        path = relpath
    else :
        path = os.path.join(Destination_Folder,relpath.replace('|','\\'))
    if (not chk_subdir(Destination_Folder, path)) or (not path):
        return redirect(url_for('download'))
    if os.path.isdir(path):
        ff_list = os.listdir(path)
        if not ff_list:
            return jsonify(isFolder = True, folderList = [])
        #remove temporary folder from the list
        if path == Destination_Folder:
            ff_list.remove(os.path.basename(temp_handle()))
        #list of file/folders paths
        ff_list_path = list (map(lambda a : os.path.join(path,a),ff_list))
        ff_send_list_file = list(map((lambda a, b : ({
            'filename' : a, 
            'filepath' : os.path.relpath(b,start=Destination_Folder).replace('\\','|'),
            'isfolder' : os.path.isdir(b)
        })), ff_list, ff_list_path))
        #dict of file/folder with their paths
        #ff_path_dict = dict(zip(ff_list_path,ff_list))
        return jsonify(isFolder = True, folderList = ff_send_list_file)
        #return render_template('file_list.html',file_paths = ff_list_path, ff_dict = ff_path_dict) 
    if os.path.isfile(path):
        file_size = round(os.stat(path).st_size/1048.576,2)
        basename = os.path.basename(path)
        db.session.add(Upload(file_name=basename, file_size=file_size))
        db.session.commit()
        return send_from_directory(os.path.dirname(path), basename, 
                                   as_attachment=True, attachment_filename=basename)
    
#app.add_url_rule ('/downloadfiles/<path>', endpoint=give_files, build_only = True)


@app.route('/download_from_react', methods=['POST'])
def download_from_react():
    #To-Do one file download
    filename = secure_filename(request.form['file_name'])
    filesize = request.form['file_size']
    if filename == '' or filesize == 0:
            return redirect(request.url)
    chunk_no = int(request.form['chunk_no'])
    total_chunk_no = int(request.form['total_number_chunks'])
    Temp_dir = temp_handle()
    Temp_file_chunk_path = os.path.join(Temp_dir, f'{filename}_part_{chunk_no}')
    with open(Temp_file_chunk_path,'wb')as f:
        f.write(request.files['chunk_data'].stream.read())
    if chunk_no==total_chunk_no:
        destinationFilePath = os.path.join(Destination_Folder,filename)
        with open(destinationFilePath, 'ab') as real_file:
            for part in range(chunk_no):
                Temp_file_part_path = os.path.join(Temp_dir, f'{filename}_part_{part+1}')
                with open(Temp_file_part_path,'rb') as temp_file:
                    real_file.write(temp_file.read())
                os.remove(Temp_file_part_path)
    # # with open(destinationFilePath, 'ab') as f:
    #     f.seek(int(request.form['chunk_offset']))
    #     f.write(request.files['chunk_data'].stream.read())
    #db.session.add(Upload(file_name=filename, file_size=filesize))
    #db.session.commit()
    return jsonify(prog = chunk_no/total_chunk_no, is_complete = chunk_no==total_chunk_no)

def temp_handle ():
    #make temp directory
    try:
        Temp_fold_dir = os.path.join(get_mydocuments(), 'Rojo_Shared_Folder','Temp')
    except Exception as e:
        Temp_fold_dir = os.path.join(os.getenv('USERPROFILE'), 'Rojo_Shared_Folder','Temp')
    if not os.path.isdir(Temp_fold_dir):
        os.mkdir(Temp_fold_dir)
    return Temp_fold_dir


if __name__ == "__main__":    
    with app.app_context():
        db.drop_all()
        db.create_all()
    #get server address
    local_ip = socket.gethostbyname_ex(socket.gethostname())[2][0]
    link = 'http://' + local_ip + ':' + '8080'
    #make a QR code
    qrc = pyqrcode.create(link)
    qrc.svg('ip_qr_serv.svg', scale=8) #save the file
    #open web browser and display ip for connection
    #webbrowser.open('ip_qr_serv.svg',0)
    app.run(host="0.0.0.0", port="8080", debug=True)