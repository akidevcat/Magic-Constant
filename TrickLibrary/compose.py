import glob, os

result = ""
for file in glob.glob("Modules/*.js"):
    with open(file, encoding="utf8", mode='r') as f:
        data=f.read()
        result += data + '\n' + '\n'
with open("composed.js", "wb") as tf:
    tf.write(result.encode('utf-8'))
input("Press Enter to continue...")