for i  in `find ./diagrams -type f -name "*.mmd"`; do
    file=$(basename "$i")
    filename=${file%.*}
    echo "$filename"
    yarn mmdc -i ./diagrams/${filename}.mmd -o ./diagrams/${filename}.svg -f
done
