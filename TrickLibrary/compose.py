import glob, os

result = ""
for file in glob.glob("Modules/*.js"):
    with open(file, 'r') as f:
        data=f.read()
        result += data + '\n' + '\n'
with open("composed.js", "w") as tf:
    tf.write(result)
input("Press Enter to continue...")