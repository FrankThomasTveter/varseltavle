#!/usr/bin/perl
# -I /usr/lib/perl/5.6.1
# -I/home/forecast/dnmi/lib/perl5/site_perl/5.6.1/IP27-irix
#
# Extract svg-icons for use in chart
#
use strict;
                            

sub Usage {                      
    print STDERR "
Usage: extract.pl files

extract takes svg-files and creates defaults.json input...
\n";                             
    exit 1;                      
}                                
#
my @files = @ARGV;
for my $file (@files) {
    if (-f $file && $file =~ m/(.*)\.svg/) {
	my $value=$1;
	my $str="";
	open(FH, '<', $file) or die $!;
	while (my $line=<FH>){
	    $str=$str . $line;
	};
	close(FH);
	$str =~ s/\n/ /g;
	$str =~ s/<\?xml[^>]*>//g;
	#$str =~ s/<defs[^\/>]*\/>//g;
	$str =~ s/<metadata.*<\/metadata>//g;
        $str =~ s/xmlns\S*//g;
	#$str =~ s/id=\S*//g;
	$str =~ s/\s+/ /g;
	$str =~ s/height=\"[^\"]*\"/height=\"Size\"/g;
	$str =~ s/width=\"[^\"]*\"/width=\"Size\"/g;
	$str =~ s/color:\#[^;]*;/color:fg;/g;
	$str =~ s/stroke:\#[^;]*;/stroke:fg;/g;
	$str =~ s/fill:\#[^;]*;/fill:bg;/g;
	$str =~ s/>\s*/>/g;
	$str =~ s/\s*</</g;
	$str =~ s/\"/\\\"/g;
	
	print ("\"$value\":\"$str\",\n");
	
    }

}
