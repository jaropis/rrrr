import csv, argparse, sys
def parse_args():
    parser = argparse.ArgumentParser(description="Separator parser")
    parser.add_argument("separator")
    parser.add_argument("input_file")
    parser.add_argument("output_file")
    return parser.parse_args()
if __name__ == '__main__':
    args = parse_args()
    with open(args.output_file, 'w') as output_file:
        with open(args.input_file, 'r') as input_file:
            for line in input_file:
                local_line = line.split("\t")
                output_file.writelines(args.separator.join(local_line))
    

